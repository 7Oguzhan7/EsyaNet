using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("appointments")]
    public class Appointment
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("claim_id")]
        public int? ClaimId { get; set; }

        [Column("lost_item_id")]
        public int LostItemId { get; set; }

        [Column("item_title")]
        public string ItemTitle { get; set; } = string.Empty;

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("user_name")]
        public string UserName { get; set; } = string.Empty;

        [Column("user_phone")]
        public string UserPhone { get; set; } = string.Empty;

        [Column("institution_id")]
        public int InstitutionId { get; set; }

        [Column("institution_name")]
        public string InstitutionName { get; set; } = string.Empty;

        [Column("appointment_date")]
        public string AppointmentDate { get; set; } = string.Empty; // e.g. "2026-08-05"

        [Column("time_slot")]
        public string TimeSlot { get; set; } = string.Empty; // e.g. "14:00 - 15:00"

        [Column("note")]
        public string? Note { get; set; }

        [Column("status")]
        public string Status { get; set; } = "scheduled"; // "scheduled", "completed", "cancelled", "no_show"

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CreateAppointmentDto
    {
        public int? ClaimId { get; set; }
        public int LostItemId { get; set; }
        public string ItemTitle { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserPhone { get; set; } = string.Empty;
        public int InstitutionId { get; set; }
        public string InstitutionName { get; set; } = string.Empty;
        public string AppointmentDate { get; set; } = string.Empty;
        public string TimeSlot { get; set; } = string.Empty;
        public string? Note { get; set; }
    }

    public class UpdateAppointmentStatusDto
    {
        public string Status { get; set; } = "completed";
    }
}
