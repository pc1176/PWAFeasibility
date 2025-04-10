using Microsoft.AspNetCore.Mvc;
using WebPush;
using PushNotificationAPI.Models;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using PushNotificationAPI.Data;

namespace PushNotificationAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly WebPushClient _webPushClient;
    private readonly string _vapidPublicKey;
    private readonly string _vapidPrivateKey;
    private readonly ApplicationDbContext _context;

    public NotificationsController(IConfiguration configuration, ApplicationDbContext context)
    {
        _webPushClient = new WebPushClient();
        _vapidPublicKey = configuration["VapidKeys:PublicKey"] ?? throw new ArgumentNullException("Vapid Public Key is required");
        _vapidPrivateKey = configuration["VapidKeys:PrivateKey"] ?? throw new ArgumentNullException("Vapid Private Key is required");
        _context = context;
    }

    [HttpGet("vapidPublicKey")]
    public IActionResult GetVapidPublicKey()
    {
        return Ok(new { publicKey = _vapidPublicKey });
    }

    [HttpGet("subscription")]
    public async Task<IActionResult> GetSubscription()
    {
        try
        {
            var subscriptions = await _context.PushSubscriptions.ToListAsync();
            return Ok(subscriptions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] PushNotificationSubscription subscription)
    {
        try
        {
            _context.PushSubscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Successfully subscribed to push notifications" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendNotification()
    {
        using var reader = new StreamReader(Request.Body);
        string message = await reader.ReadToEndAsync();
        Console.WriteLine("Received message: " + message);
        try
        {
            var subscriptions = await _context.PushSubscriptions.OrderByDescending(s => s.Id).FirstOrDefaultAsync();

            if (subscriptions == null)
            {
                return NotFound("No subscriptions found");
            }

            var vapidDetails = new VapidDetails(
                "mailto:test@example.com",
                _vapidPublicKey,
                _vapidPrivateKey
            );

            var payload = new
            {
                title = "location match",
                body = message,
                icon = "/assets/icons/icon-72x72.png",
                badge = "/assets/icons/icon-72x72.png",
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };

            var serializedPayload = JsonSerializer.Serialize(payload);
            var failedSubscriptions = new List<PushNotificationSubscription>();

            // foreach (var subscription in subscriptions)
            // {
            try
            {
                var pushSubscription = new PushSubscription(
                    subscriptions.Endpoint,
                    subscriptions.Keys.P256dh,
                    subscriptions.Keys.Auth
                );

                await _webPushClient.SendNotificationAsync(
                    pushSubscription,
                    serializedPayload,
                    vapidDetails
                );
            }
            catch (Exception)
            {
                failedSubscriptions.Add(subscriptions);
            }
            // }

            // Remove failed subscriptions
            if (failedSubscriptions.Any())
            {
                _context.PushSubscriptions.RemoveRange(failedSubscriptions);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = "Notifications sent successfully",
                totalSent = 1,
                failedCount = failedSubscriptions.Count
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
