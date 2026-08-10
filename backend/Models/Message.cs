using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("messages")]
    public class Message
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("from_user_id")]
        public int FromUserId { get; set; }

        [Column("from_name")]
        public string FromName { get; set; } = string.Empty;

        [Column("to_inst_id")]
        public int? ToInstId { get; set; }

        [Column("to_inst_name")]
        public string? ToInstName { get; set; }

        [Column("to_user_id")]
        public int? ToUserId { get; set; }

        [Column("to_role")]
        public string ToRole { get; set; } = "institution";

        [Column("msg_type")]
        public string MsgType { get; set; } = "Genel";

        [Column("text")]
        public string Text { get; set; } = string.Empty;

        [Column("is_read")]
        public bool IsRead { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CreateMessageDto
    {
        public int FromUserId { get; set; }
        public string FromName { get; set; } = string.Empty;
        public int? ToInstId { get; set; }
        public string? ToInstName { get; set; }
        public int? ToUserId { get; set; }
        public string ToRole { get; set; } = "institution";
        public string MsgType { get; set; } = "Genel";
        public string Text { get; set; } = string.Empty;
    }
}
