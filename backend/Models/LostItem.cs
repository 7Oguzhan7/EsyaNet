using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("lost_items")]
    public class LostItem
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("title")]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Required]
        [Column("category")]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [Column("date_found")]
        public DateTime DateFound { get; set; }

        [Column("location_found")]
        [MaxLength(255)]
        public string? LocationFound { get; set; }

        [Column("image_url")]
        [MaxLength(255)]
        public string? ImageUrl { get; set; }

        [Column("institution_id")]
        public int? InstitutionId { get; set; }

        [ForeignKey(nameof(InstitutionId))]
        public virtual Institution? Institution { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(30)]
        public string Status { get; set; } = "waiting_owner"; // 'waiting_owner', 'delivered_owner', 'ready_for_auction', 'in_auction', 'sold', 'donated'

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
