import api from './api';

export const workspaceService = {
  async getWorkspaces() {
    const response = await api.get('/workspaces');
    return response.data;
  },

  async createWorkspace(name, description) {
    const response = await api.post('/workspaces', { name, description });
    return response.data;
  },

  async getWorkspace(id) {
    const response = await api.get(`/workspaces/${id}`);
    return response.data;
  },

  async inviteMember(workspaceId, email) {
    const response = await api.post(`/workspaces/${workspaceId}/invite`, { email });
    return response.data;
  },

  async acceptInvitation(workspaceId) {
    const response = await api.post(`/workspaces/${workspaceId}/accept`);
    return response.data;
  },

  async getNotes(workspaceId) {
    const response = await api.get(`/workspaces/${workspaceId}/notes`);
    return response.data;
  },

  async createNote(workspaceId, title, content) {
    const response = await api.post(`/workspaces/${workspaceId}/notes`, { title, content });
    return response.data;
  },

  async deleteNote(workspaceId, noteId) {
    const response = await api.delete(`/workspaces/${workspaceId}/notes/${noteId}`);
    return response.data;
  }
};