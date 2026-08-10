using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("auctions")]
    public class Auction
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
        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Required]
        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Required]
        [Column("start_price")]
        public decimal StartPrice { get; set; }

        [Required]
        [Column("current_price")]
        public decimal CurrentPrice { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // 'pending', 'active', 'completed', 'no_bid_ended'

        [Column("winner_id")]
        public int? WinnerId { get; set; }

        [ForeignKey(nameof(WinnerId))]
        public virtual User? Winner { get; set; }
    }
}
