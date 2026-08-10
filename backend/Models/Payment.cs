using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("payments")]
    public class Payment
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("auction_id")]
        public int AuctionId { get; set; }

        [ForeignKey(nameof(AuctionId))]
        public virtual Auction? Auction { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }

        [Required]
        [Column("amount")]
        public decimal Amount { get; set; }

        [Required]
        [Column("payment_status")]
        [MaxLength(20)]
        public string PaymentStatus { get; set; } = "pending"; // 'pending', 'paid', 'failed'

        [Required]
        [Column("delivery_status")]
        [MaxLength(20)]
        public string DeliveryStatus { get; set; } = "pending"; // 'pending', 'shipped', 'delivered'

        [Column("payment_date")]
        public DateTime? PaymentDate { get; set; }
    }
}
