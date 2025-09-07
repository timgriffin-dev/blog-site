---
title: "Understanding ID Tokens and Access Tokens"
date: "2025-09-07"
description: "ID tokens contain identity claims about authenticated users. Access tokens provide proof of authorization to access protected resources. A real implementation story, .NET examples, and advanced security patterns."
---
## Introduction

OAuth 2.0 is an authorization framework that allows applications to access protected resources on behalf of users. OpenID Connect is an identity layer built on top of OAuth 2.0 that standardizes how user authentication information gets shared between systems.

These protocols use several token types. This post focuses on two: ID tokens, which contain claims about the authenticated user and always use JWT format, and access tokens, which provide credentials for API access and can be opaque strings or JWTs.

Mixing up these tokens creates security issues and architectural problems.

## Real-World Example

My team needed to implement beta testing for new features. This required setting up role-based access control and adding users to a beta-tester group. We planned to include the beta-tester role as a claim in our access tokens and check for it on specific endpoints.

Configuring custom claims in our third-party authorization server turned out to be more complex than expected. The quick workaround was to add the beta-tester role to the ID token instead and pass that to our backend APIs.

This approach seemed reasonable - the ID token already contained user information and was a signed JWT that our backend could validate. But it created several problems:

**Wrong audience**: ID tokens target the frontend application, not backend APIs. Our APIs would be trusting tokens issued to a different recipient.

**Architecture violation**: This breaks the intended separation of concerns where ID tokens carry identity information to clients, while access tokens carry authorization information to APIs.

**Frontend complexity**: Every API call would need modification to send ID tokens instead of the default access tokens we are already sending.

We eventually figured out the custom access token configuration and added the beta-tester claim there instead. This kept the proper token separation and avoided any frontend changes.
  
### Token Types

##### ID Tokens
ID tokens are always JWTs because the OpenID Connect specification requires this format. The JWT structure provides standardized claims and cryptographic verification that clients need for authentication flows.

ID tokens contain user identity information - name, email, roles, and other profile data. They also include standard claims like `iss` (issuer), `aud` (audience), and `exp` (expiration). Since JWTs are base64-encoded rather than encrypted, ID token contents are readable by anyone, so they shouldn't contain sensitive information.

You request ID tokens by including the `openid` scope in your authorization request. This typically happens when your client application redirects users to the authorization server for login. They're typically short-lived, often expiring within an hour.

##### Access Tokens
Access tokens authorize API requests. When a user authenticates, the authorization server issues an access token that defines what resources the application can access on the user's behalf.

Access tokens can be opaque strings or JWTs, depending on authorization server configuration. Unlike ID tokens, they target APIs rather than client applications.

Access tokens contain authorization information - scopes for broad permissions and claims for specific access decisions. In role-based access control systems, these claims might include user roles like "admin" or "beta-tester" that APIs use for authorization decisions.

They're typically short-lived for security reasons. If an attacker steals an access token, they can make API requests with the victim's permissions until the token expires. This makes proper token storage critical, especially in browser-based applications.

##### Refresh Tokens
Refresh tokens obtain new access tokens without requiring user re-authentication. They typically have longer lifespans than access tokens and are used to maintain sessions but must be stored securely and rotated regularly to prevent abuse.

### .NET Examples

##### Multiple Audience Configuration
When transitioning to new access token configurations, your API must accept tokens from both old and new sources. Configure JWT bearer authentication to validate multiple audiences:

```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://your-auth-server.com";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, 
            ValidIssuer = "https://your-auth-server.com",
            ValidateAudience = true,
            ValidAudiences = new[]
            {
                "legacy-api-audience",
                "new-api-audience"
            },
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
        };
    });
```

The `ValidAudiences` array accepts tokens issued for either audience value. Deploy this configuration before changing token issuance on the authorization server. This prevents API rejections during the transition period and enables zero-downtime deployment.

##### RBAC with Access Token Claims
Extract user roles from access tokens to implement RBAC authorization decisions. Access tokens contain role claims that APIs can use to control feature access and enforce permissions.

This example demonstrates claims extraction for feature-level authorization that enables early access for specific user groups. The pattern combines role-based checks with feature flags to control which users can access new functionality during development phases.


```csharp
public interface IFeatureAuthorizationService
{
    Task<bool> HasFeatureAccessAsync(
        ClaimsPrincipal user, 
        string requiredRole, 
        string featureName);
}

public class FeatureAuthorizationService(
  IFeatureManager featureManager) : IFeatureAuthorizationService
{
    public async Task<bool> HasFeatureAccessAsync(
        ClaimsPrincipal user, 
        string requiredRole, 
        string featureName)
    {
        // "roles" claim name may vary by auth provider
        var userRoles = user.FindAll("roles").Select(c => c.Value); 
        var hasRoleAccess = userRoles.Contains(requiredRole);
        var publicRelease = await featureManager.IsEnabledAsync($"{featureName}_Public");
        var betaEnabled = await featureManager.IsEnabledAsync($"{featureName}_Beta");   

        return publicRelease || (hasRoleAccess && betaEnabled);
    }
}

// Register service in dependency injection container
services.AddScoped<IFeatureAuthorizationService, FeatureAuthorizationService>();

// Configure endpoints with role-based authorization
app.MapGet("/api/new-dashboard", async (
    HttpContext context, 
    IFeatureAuthorizationService authService) =>
{
    if (await authService.HasFeatureAccessAsync(
        context.User, 
        "new-dashboard-beta", 
        "NewDashboard"))
    {
        return Results.Ok(new { message = "New dashboard enabled" });
    }
    
    return Results.NotFound();
})
.RequireAuthorization();

app.MapGet("/api/advanced-analytics", async (
    HttpContext context, 
    IFeatureAuthorizationService authService) =>
{
    if (await authService.HasFeatureAccessAsync(
        context.User, 
        "advanced-analytics-beta", 
        "AdvancedAnalytics"))
    {
        return Results.Ok(new { data = "Advanced analytics data" });
    }
    
    return Results.NotFound();
})
.RequireAuthorization();
```


The service extracts role claims from access tokens and combines them with feature flags for flexible access control. Each endpoint checks for feature-specific roles rather than generic beta access. The boolean logic handles both beta testing and public rollout without requiring code changes when transitioning between phases. This service approach also enables straightforward unit testing of authorization logic by mocking `IFeatureManager` and testing different combinations of user roles and feature flags without requiring the entire ASP.NET authorization pipeline.

These patterns solve common implementation challenges: zero-downtime token migrations and fine-grained authorization. The multiple audience configuration enables smooth transitions between token formats, while the claims extraction pattern provides flexible access control that scales with your feature development process.


## Advanced Security Patterns

##### Secure Token Storage in Browsers
Browser storage like `localStorage` and `sessionStorage` is vulnerable to XSS attacks that can steal tokens. Store access tokens in `httpOnly` cookies instead, which prevent JavaScript access to tokens. For SPAs, consider the Backend-for-Frontend (BFF) pattern where tokens never reach the browser. Advanced BFF implementations like Phantom Tokens use opaque tokens in the browser while API gateways exchange them for JWTs with full claims. Split Token patterns send only JWT signatures to clients while gateways reconstruct complete tokens from cached components.

##### Client-Bound Tokens (DPoP)
Standard bearer tokens work for anyone who possesses them. DPoP binds access tokens to a public key during issuance by the authorization server. Clients must prove possession of the corresponding private key when using the access token at the resource server. The client creates a DPoP proof JWT that demonstrates possession of the private key and includes a hash of the access token. Stolen tokens become useless without the matching private key.

##### Certificate-Bound Access Tokens (mTLS)
Mutual TLS binds access tokens to client certificates used during authentication. The authorization server includes the certificate thumbprint in the access token after successful mutual TLS client authentication. When accessing APIs, clients must establish a mutual TLS session using the same certificate. The API compares the certificate thumbprint from the TLS session with the thumbprint in the token. Stolen tokens are useless without the corresponding private key and certificate.


### Conclusion

ID tokens contain identity claims for client applications. Access tokens authorize API requests. Using each token for its intended purpose prevents architectural problems and security vulnerabilities. The patterns shown here - multiple audience validation, granular RBAC, and advanced security techniques - solve real implementation challenges. Proper token architecture supports both current requirements and future security enhancements.