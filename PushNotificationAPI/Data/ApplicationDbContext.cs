using Microsoft.EntityFrameworkCore;
using PushNotificationAPI.Models;

namespace PushNotificationAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<PushNotificationSubscription> PushSubscriptions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PushNotificationSubscription>()
                .Property(s => s.Keys)
                .HasColumnType("jsonb");
        }
    }
} 