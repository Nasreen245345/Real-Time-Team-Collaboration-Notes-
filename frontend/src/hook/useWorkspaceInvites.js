// src/hooks/useWorkspaceInvites.js (React hook)
import { useEffect, useState } from "react";
import { connectSocket, getSocket } from "../services/socket";

export default function useWorkspaceInvites(token) {
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);

    const onInvite = (payload) => {
      // payload: { workspaceId, workspaceName, inviter, invitedAt }
      setInvites(prev => [payload, ...prev]);
      // show toast or UI
      console.log("Workspace invite:", payload);
    };

    socket.on("workspace-invite", onInvite);

    // cleanup
    return () => {
      socket.off("workspace-invite", onInvite);
    };
  }, [token]);

  // accept invite helper (emit join-workspace via socket)
  const acceptInvite = (invite) => {
    const socket = getSocket();
    if (!socket) return console.warn("Socket not ready");
    // optionally call HTTP API to accept (persist membership)
    // But we also join socket room so real-time updates work instantly:
    socket.emit("join-workspace", { workspaceId: invite.workspaceId });
    // remove invite locally
    setInvites(prev => prev.filter(i => i.workspaceId !== invite.workspaceId));
  };

  return { invites, acceptInvite };
}
