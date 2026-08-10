using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("institutions")]
    public class Institution
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("address")]
        public string Address { get; set; } = string.Empty;

        [Required]
        [Column("latitude")]
        public decimal Latitude { get; set; }

        [Required]
        [Column("longitude")]
        public decimal Longitude { get; set; }

        [Column("contact_number")]
        [MaxLength(20)]
        public string? ContactNumber { get; set; }
    }
}
