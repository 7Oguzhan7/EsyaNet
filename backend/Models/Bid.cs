using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("bids")]
    public class Bid
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

        [Column("bid_time")]
        public DateTime BidTime { get; set; } = DateTime.UtcNow;
    }
}
