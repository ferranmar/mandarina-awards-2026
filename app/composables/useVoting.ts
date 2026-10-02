let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

export default function useVoting() {
  const categories = useState<Category[]>("categories", () => []);
  const myVotes = useState<Record<string, string>>("myVotes", () => ({}));
  const voterName = useState<string | null>("voterName", () => null);
  const isAdmin = useState<boolean>("isAdmin", () => false);
  const connected = useState<boolean>("connected", () => false);

  function connectSocket() {
    if (!import.meta.client) {
      console.warn('connectSocket() called from server ')
      return
    }

    if (socket) return;
    const proto = location.protocol === "https:" ? "wss" : "ws";
    socket = new WebSocket(`${proto}://${location.host}/api/ws`);
    socket.onopen = () => {
      connected.value = true;
    };
    socket.onclose = () => {
      connected.value = false;
      socket = null;
      reconnectTimer = setTimeout(connectSocket, 2000);
    };
    socket.onerror = () => {
      socket?.close();
    };
    socket.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "state") categories.value = msg.payload.categories;
      } catch {}
    };
  }

  async function init() {
    if (initialized) return;
    initialized = true;
    try {
      const data = await $fetch("/api/state");
      categories.value = data.categories;
      myVotes.value = data.myVotes || {};
      voterName.value = data.voterName;
    } catch {}
    try {
      const me = await $fetch("/api/admin/me");
      isAdmin.value = !!me.isAdmin;
    } catch {}
    connectSocket();
  }

  function closeConnection() {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (socket) socket.close();
  }

  async function submitName(name: string) {
    const res = await $fetch("/api/register", {
      method: "POST",
      body: { name },
    });
    voterName.value = res.name;
  }

  async function castVote(categoryId: string, nomineeId: string) {
    await $fetch("/api/vote", {
      method: "POST",
      body: { categoryId, nomineeId },
    });
    myVotes.value = { ...myVotes.value, [categoryId]: nomineeId };
  }

  async function loginAdmin(password: string) {
    await $fetch("/api/admin/login", { method: "POST", body: { password } });
    isAdmin.value = true;
  }

  async function logoutAdmin() {
    await $fetch("/api/admin/logout", { method: "POST" });
    isAdmin.value = false;
  }

  async function createCategory(name: string, nominees: string[]) {
    await $fetch("/api/admin/category", {
      method: "POST",
      body: { name, nominees },
    });
  }

  async function toggleCategoryStatus(cat: Category) {
    const status = cat.status === "open" ? "closed" : "open";
    await $fetch(`/api/admin/category/${cat.id}`, {
      method: "PATCH",
      body: { status },
    });
  }

  async function resetCategoryVotes(cat: Category) {
    if (!confirm("¿Borrar todos los votos de esta categoría?")) return;
    await $fetch(`/api/admin/category/${cat.id}/reset`, { method: "POST" });
  }

  async function deleteCategory(cat: Category) {
    if (!confirm("¿Eliminar esta categoría por completo?")) return;
    await $fetch(`/api/admin/category/${cat.id}`, { method: "DELETE" });
  }

  return {
    categories,
    myVotes,
    voterName,
    isAdmin,
    connected,
    init,
    closeConnection,
    submitName,
    castVote,
    loginAdmin,
    logoutAdmin,
    createCategory,
    toggleCategoryStatus,
    resetCategoryVotes,
    deleteCategory,
  };
}
