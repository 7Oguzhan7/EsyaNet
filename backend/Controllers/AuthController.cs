using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
        {
            // E-posta benzersizlik kontrolü
            var exists = await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (exists)
            {
                return BadRequest(new { Message = "Bu e-posta adresi zaten kullanımda." });
            }

            // Şifre Hashing (BCrypt ile)
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                NameSurname = dto.NameSurname,
                Email = dto.Email.ToLower(),
                PasswordHash = passwordHash,
                Role = dto.Role.ToLower(),
                Phone = dto.Phone,
                InstitutionId = dto.InstitutionId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                NameSurname = user.NameSurname,
                Email = user.Email,
                Role = user.Role,
                Phone = user.Phone,
                InstitutionId = user.InstitutionId
            };

            return Ok(userDto);
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (user == null)
            {
                return BadRequest(new { Message = "E-posta adresi veya şifre hatalı." });
            }

            // Şifre Doğrulama (BCrypt ile veya demo şifresi '123456')
            bool isVerified = dto.Password == "123456" || (user.PasswordHash.StartsWith("$2") && BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash));
            if (!isVerified)
            {
                return BadRequest(new { Message = "E-posta adresi veya şifre hatalı." });
            }

            // JWT Token Oluşturma
            string token = GenerateJwtToken(user);

            var response = new AuthResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    NameSurname = user.NameSurname,
                    Email = user.Email,
                    Role = user.Role,
                    Phone = user.Phone,
                    InstitutionId = user.InstitutionId
                }
            };

            return Ok(response);
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            
            var keyString = _configuration["Jwt:Key"] ?? "KayiPesyaAcikArtirmaVeSatinAlmaSistemiGizliAnahtari1234567890";
            var key = Encoding.ASCII.GetBytes(keyString);

            var issuer = _configuration["Jwt:Issuer"] ?? "LostPropertyAPI";
            var audience = _configuration["Jwt:Audience"] ?? "LostPropertyClient";
            var expireMinutes = double.Parse(_configuration["Jwt:ExpireMinutes"] ?? "180");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.NameSurname),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(expireMinutes),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
