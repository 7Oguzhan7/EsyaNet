using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("donations")]
    public class Donation
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("lost_item_id")]
        public int LostItemId { get; set; }

        [ForeignKey(nameof(LostItemId))]
        public virtual LostItem? LostItem { get; set; }

        [Required]
        [Column("recipient_id")]
        public int RecipientId { get; set; }

        [ForeignKey(nameof(RecipientId))]
        public virtual User? Recipient { get; set; }

        [Column("request_date")]
        public DateTime RequestDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // 'pending', 'approved', 'rejected', 'delivered'
    }
}
