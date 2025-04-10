namespace PushNotificationAPI.Models
{
    public class PushNotificationSubscription
    {
        public int Id { get; set; }
        public string Endpoint { get; set; } = string.Empty;
        public PushKeys Keys { get; set; } = new PushKeys();
    }

    public class PushKeys
    {
        public string P256dh { get; set; } = string.Empty;
        public string Auth { get; set; } = string.Empty;
    }
}
