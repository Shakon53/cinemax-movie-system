FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MovieManagement.API/MovieManagement.API.csproj", "MovieManagement.API/"]
RUN dotnet restore "MovieManagement.API/MovieManagement.API.csproj"
COPY MovieManagement.API/ MovieManagement.API/
WORKDIR "/src/MovieManagement.API"
RUN dotnet build "MovieManagement.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MovieManagement.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MovieManagement.API.dll"]
