using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessagesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/messages?userId=5  — citizen's messages
        // GET: api/messages?instId=2  — institution's messages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessages([FromQuery] int? userId, [FromQuery] int? instId)
        {
            var query = _context.Messages.AsQueryable();

            if (userId.HasValue)
                query = query.Where(m => m.FromUserId == userId.Value || m.ToUserId == userId.Value);
            else if (instId.HasValue)
                query = query.Where(m => m.ToInstId == instId.Value);

            return await query.OrderBy(m => m.CreatedAt).ToListAsync();
        }

        // POST: api/messages
        [HttpPost]
        public async Task<ActionResult<Message>> CreateMessage(CreateMessageDto dto)
        {
            var message = new Message
            {
                FromUserId = dto.FromUserId,
                FromName = dto.FromName,
                ToInstId = dto.ToInstId,
                ToInstName = dto.ToInstName,
                ToUserId = dto.ToUserId,
                ToRole = dto.ToRole,
                MsgType = dto.MsgType,
                Text = dto.Text,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(message);
        }

        // PUT: api/messages/{id}/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null) return NotFound();

            message.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok(message);
        }

        // PUT: api/messages/read-thread?fromUserId=5&toInstId=2
        [HttpPut("read-thread")]
        public async Task<IActionResult> MarkThreadAsRead([FromQuery] int? fromUserId, [FromQuery] int? toInstId)
        {
            var msgs = _context.Messages.AsQueryable();
            if (fromUserId.HasValue) msgs = msgs.Where(m => m.FromUserId == fromUserId.Value);
            if (toInstId.HasValue) msgs = msgs.Where(m => m.ToInstId == toInstId.Value);

            await msgs.ForEachAsync(m => m.IsRead = true);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
