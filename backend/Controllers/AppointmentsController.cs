using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/appointments?userId=X  or  ?instId=Y
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments([FromQuery] int? userId, [FromQuery] int? instId)
        {
            var query = _context.Appointments.AsQueryable();

            if (userId.HasValue)
                query = query.Where(a => a.UserId == userId.Value);
            else if (instId.HasValue)
                query = query.Where(a => a.InstitutionId == instId.Value);

            return await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
        }

        // POST: api/appointments
        [HttpPost]
        public async Task<ActionResult<Appointment>> CreateAppointment(CreateAppointmentDto dto)
        {
            var appt = new Appointment
            {
                ClaimId = dto.ClaimId,
                LostItemId = dto.LostItemId,
                ItemTitle = dto.ItemTitle,
                UserId = dto.UserId,
                UserName = dto.UserName,
                UserPhone = dto.UserPhone,
                InstitutionId = dto.InstitutionId,
                InstitutionName = dto.InstitutionName,
                AppointmentDate = dto.AppointmentDate,
                TimeSlot = dto.TimeSlot,
                Note = dto.Note,
                Status = "scheduled",
                CreatedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appt);
            await _context.SaveChangesAsync();

            return Ok(appt);
        }

        // PUT: api/appointments/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateAppointmentStatusDto dto)
        {
            var appt = await _context.Appointments.FindAsync(id);
            if (appt == null) return NotFound();

            appt.Status = dto.Status;
            await _context.SaveChangesAsync();

            // If completed, update item status to delivered_owner
            if (dto.Status == "completed")
            {
                var item = await _context.LostItems.FindAsync(appt.LostItemId);
                if (item != null)
                {
                    item.Status = "delivered_owner";
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(appt);
        }

        // DELETE: api/appointments/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var appt = await _context.Appointments.FindAsync(id);
            if (appt == null) return NotFound();

            appt.Status = "cancelled";
            await _context.SaveChangesAsync();
            return Ok(appt);
        }
    }
}
