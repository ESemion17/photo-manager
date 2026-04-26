using Microsoft.AspNetCore.SignalR;

namespace PhotoManager.API.Hubs;

public class ProgressHub : Hub
{
    public async Task JoinProgressGroup() =>
        await Groups.AddToGroupAsync(Context.ConnectionId, "progress");
}
