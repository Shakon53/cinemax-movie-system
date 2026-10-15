using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MovieManagement.API.Data;
namespace MovieManagement.API.Migrations;
[DbContext(typeof(MovieDbContext))]
[Migration("20261015000000_UniqueUserIdentity")]
public class UniqueUserIdentity : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""CREATE UNIQUE INDEX "IX_Users_Email_Normalized" ON "Users" (lower("Email"));""");
        migrationBuilder.Sql("""CREATE UNIQUE INDEX "IX_Users_Username_Normalized" ON "Users" (lower("Username"));""");
    }
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""DROP INDEX "IX_Users_Email_Normalized";""");
        migrationBuilder.Sql("""DROP INDEX "IX_Users_Username_Normalized";""");
    }
}
