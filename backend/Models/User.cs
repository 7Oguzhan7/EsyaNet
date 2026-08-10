using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name_surname")]
        [MaxLength(100)]
        public string NameSurname { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [Column("email")]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("password_hash")]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [Column("role")]
        [MaxLength(20)]
        public string Role { get; set; } = "citizen"; // 'citizen', 'institution', 'admin'

        [Column("phone")]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [Column("institution_id")]
        public int? InstitutionId { get; set; }

        [ForeignKey(nameof(InstitutionId))]
        public virtual Institution? Institution { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
