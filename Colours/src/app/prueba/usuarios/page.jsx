"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  Power,
  Archive,
  Edit,
  UserPlus,
  UserMinus,
  ChevronDown,
  ChevronUp,
  ListFilter,
} from "lucide-react";
import UsuarioModal from "../components/usuario-modal";
import UsuarioEditarModal from "../components/usuario-editar-modal";
import Header from "../components/header";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";
import { AuthContext } from "../../context/AuthContext";
import { useAuth0 } from "@auth0/auth0-react";

const API_URL = apiUrls;

export default function Usuarios() {
  const { authData, setAuthData } = useContext(AuthContext);
  const { logout } = useAuth0();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("active");
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isCurrentUser = (userId) => {
    return authData?.user?.id === userId;
  };

  const handleLogout = async () => {
    try {
      setAuthData(null);
      localStorage.removeItem("authData");
      await logout({ returnTo: window.location.origin });
      router.push("/login");
    } catch (error) {
      console.error("Error durante el logout:", error);
      window.location.href = "/login";
    }
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/users/usuarios?`;

      if (filterMode === "active") {
        url += "status=true";
      } else if (filterMode === "inactive") {
        url += "status=false";
      } else {
        url += "includeAll=true";
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Error del servidor (${response.status}): No se pudieron cargar los usuarios`
        );
      }

      const data = await response.json();

      if (filterMode === "all" && Array.isArray(data)) {
        setUsuarios(data);
      } else {
        setUsuarios(data);
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: "Error al cargar usuarios",
        text: err.message || "No se pudo establecer conexión con el servidor",
        footer:
          "Intente refrescar la página o contacte al administrador del sistema",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchUsuarios();
    }
  }, [filterMode, isClient]);

  // Agrega este console.log para ver los datos de usuarios en la tabla
  useEffect(() => {
    console.log("Usuarios cargados en la tabla:", usuarios);
  }, [usuarios]);

  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const searchText = removeAccents(busqueda.toLowerCase());
    return (
      (usuario.usuario &&
        removeAccents(usuario.usuario.toLowerCase()).includes(searchText)) ||
      (usuario.email &&
        removeAccents(usuario.email.toLowerCase()).includes(searchText)) ||
      (usuario.nombre &&
        removeAccents(usuario.nombre.toLowerCase()).includes(searchText)) ||
      (usuario.apellido &&
        removeAccents(usuario.apellido.toLowerCase()).includes(searchText)) ||
      (usuario.nombre &&
        usuario.apellido &&
        removeAccents(
          `${usuario.nombre} ${usuario.apellido}`.toLowerCase()
        ).includes(searchText))
    );
  });

  const toggleUserSelection = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === currentItems.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentItems.map((user) => user.id));
    }
  };

  const handleAsignarAdministrador = () => {
    if (selectedUsers.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Ningún usuario seleccionado",
        text: "Por favor selecciona al menos un usuario para asignar roles",
      });
      return;
    }

    const currentUserInSelection = selectedUsers.some(isCurrentUser);

    Swal.fire({
      title: `Asignar rol de administrador`,
      html: `
        <div class="text-left">
          <p>¿Estás seguro de asignar el rol de <strong>administrador</strong> a <strong>${
            selectedUsers.length
          }</strong> usuario(s) seleccionado(s)?</p>
          ${
            currentUserInSelection
              ? '<div class="mt-2 text-red-500">Nota: Serás desconectado automáticamente si cambias tu propio rol</div>'
              : ""
          }
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#BF8D6B",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, asignar administrador (${selectedUsers.length})`,
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        asignarRolMultiple("admin");
      }
    });
  };

  const handleAsignarVendedor = () => {
    if (selectedUsers.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Ningún usuario seleccionado",
        text: "Por favor selecciona al menos un usuario para asignar roles",
      });
      return;
    }

    const currentUserInSelection = selectedUsers.some(isCurrentUser);

    Swal.fire({
      title: "Asignar rol de vendedor",
      html: `
        <div class="text-left">
          <p>¿Estás seguro de asignar el rol de <strong>vendedor</strong> a <strong>${
            selectedUsers.length
          }</strong> usuario(s) seleccionado(s)?</p>
          ${
            currentUserInSelection
              ? '<div class="mt-2 text-red-500">Nota: Serás desconectado automáticamente si cambias tu propio rol</div>'
              : ""
          }
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#BF8D6B",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, asignar vendedor (${selectedUsers.length})`,
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        asignarRolMultiple("vendor");
      }
    });
  };

  const asignarRolMultiple = async (rol) => {
    try {
      const promises = selectedUsers.map(async (userId) => {
        const response = await fetch(
          `${API_URL}/api/users/change-role/${userId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rol }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message ||
              `Error al asignar rol al usuario ID: ${userId} (${response.status})`
          );
        }

        return response;
      });

      const results = await Promise.allSettled(promises);

      const exitosos = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const fallidos = results.length - exitosos;

      const errores = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason.message);

      await fetchUsuarios();
      setSelectedUsers([]);

      Swal.fire({
        icon: exitosos > 0 ? "success" : "error",
        title: exitosos > 0 ? "Roles asignados" : "Error",
        text: `${exitosos} usuario(s) actualizados con éxito. ${
          fallidos > 0
            ? `${fallidos} usuario(s) no pudieron ser actualizados.`
            : ""
        }`,
        ...(errores.length > 0 && {
          footer: `<ul class="text-left"><li>${errores
            .slice(0, 3)
            .join("</li><li>")}</li>${
            errores.length > 3 ? "<li>...</li>" : ""
          }</ul>`,
        }),
      });

      if (selectedUsers.some(isCurrentUser)) {
        Swal.fire({
          title: "Tu rol ha cambiado",
          text: "Serás redirigido al login para aplicar los cambios",
          icon: "info",
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
          handleLogout();
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al asignar roles",
        text: error.message || "Ocurrió un error al asignar los roles",
        footer:
          "Verifica que los usuarios seleccionados existan y tengan los permisos adecuados",
      });
    }
  };

  const changeUserStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? "activar" : "desactivar";

    const confirmResult = await Swal.fire({
      title: `¿${newStatus ? "Activar" : "Desactivar"} usuario?`,
      text: `Estás a punto de ${actionText} este usuario.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#BF8D6B",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: "Cancelar",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/users/soft-delete/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Error al ${actionText} el usuario (${response.status}: ${response.statusText})`
        );
      }

      await fetchUsuarios();

      await Swal.fire({
        title: `Usuario ${newStatus ? "activado" : "desactivado"}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        footer: `No se pudo ${actionText} el usuario. Intente nuevamente o contacte al administrador.`,
      });
    }
  };

  const agregarUsuario = async (nuevoUsuario) => {
    try {
      const response = await fetch(`${API_URL}/api/users/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Error al crear usuario (${response.status}: ${response.statusText})`
        );
      }

      await fetchUsuarios();
      setShowModal(false);
      Swal.fire({
        icon: "success",
        title: "Usuario creado",
        text: "El usuario fue creado correctamente",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al crear usuario",
        text:
          error.message ||
          "Hubo un problema con el servidor al intentar crear el usuario",
        footer:
          "Comprueba que todos los campos sean válidos y que el correo no esté duplicado",
      });
    }
  };

  const modificarUsuario = async (id, datosActualizados) => {
    try {
      Swal.fire({
        title: "Guardando cambios...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(`${API_URL}/api/users/perfil/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(datosActualizados),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Error al modificar usuario (${response.status}: ${response.statusText})`
        );
      }

      await fetchUsuarios();

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Los datos del usuario se actualizaron correctamente",
        timer: 2000,
        showConfirmButton: false,
      });

      // Solo cerrar sesión si es el usuario actual Y se modificó el rol
      if (isCurrentUser(id) && datosActualizados.rol) {
        Swal.fire({
          title: "Tu rol ha cambiado",
          text: "Serás redirigido al login para aplicar los cambios",
          icon: "info",
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
          handleLogout();
        });
      }
    } catch (error) {
      console.error("Error al modificar usuario:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un problema al actualizar el usuario",
        footer: "Por favor verifique los datos e intente nuevamente",
      });

      throw error;
    }
  };

  const borrarUsuario = async (id) => {
    const confirmResult = await Swal.fire({
      title: "¿Eliminar permanentemente?",
      text: "Esta acción no se puede deshacer. ¿Deseas continuar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmResult.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/users/delete/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message ||
              `Error al eliminar el usuario (${response.status}: ${response.statusText})`
          );
        }

        await fetchUsuarios();
        Swal.fire(
          "Eliminado",
          "El usuario ha sido eliminado correctamente",
          "success"
        );
      } catch (error) {
        Swal.fire({
          title: "Error al eliminar",
          text: error.message,
          icon: "error",
          footer:
            "El usuario podría estar vinculado a registros existentes o no tienes los permisos necesarios para eliminarlo",
        });
      }
    }
  };

  const cambiarRolUsuario = async (id, rol) => {
    try {
      const response = await fetch(`${API_URL}/api/users/change-role/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Error al cambiar el rol del usuario (${response.status}: ${response.statusText})`
        );
      }

      await fetchUsuarios();

      if (isCurrentUser(id)) {
        Swal.fire({
          title: "Tu rol ha cambiado",
          text: "Serás redirigido al login para aplicar los cambios",
          icon: "info",
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
          handleLogout();
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Rol actualizado",
          text: `El rol ha sido actualizado a ${rol}`,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cambiar rol",
        text: error.message || "Ocurrió un error al cambiar el rol",
        footer:
          "Verifica que tengas los permisos adecuados para realizar esta acción",
      });
    }
  };

  const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage);
  const currentItems = usuariosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!isClient) return null;

  if (loading) {
    return (
      <div className="p-2 md:p-4 bg-gray-900 min-h-screen">
        <Header title="Usuarios" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-300">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 md:p-4 bg-gray-900 min-h-screen">
        <Header title="Usuarios" />
        <div className="alert alert-error bg-red-900 border-red-700">
          <p className="text-red-200">Error: {error}</p>
          <button
            className="btn btn-sm btn-outline border-red-600 text-red-200 hover:bg-red-700 mt-2"
            onClick={() => fetchUsuarios()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4 ">
      {/* <Header title="Usuarios" /> */}

      <div className="mb-4 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
          {/* Campo de búsqueda */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar Usuario"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full md:w-64 py-2 px-8 text-sm bg-black border-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent rounded-full"
              style={{
                borderColor: "#BF8D6B",
                color: "#ffffffff",
                "--tw-ring-color": "#BF8D6B",
              }}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-4 w-4" style={{ color: "#BF8D6B" }} />
            </div>
          </div>

          {/* Botones de filtro y acción */}
          <div className="flex flex-wrap gap-2 md:gap-2">
            {/* Botón para mostrar/ocultar filtros en móvil */}
            <div className="md:hidden w-full">
              <button
                className="w-full px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black"
                style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#BF8D6B";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "#ffffffff";
                }}
                onClick={() => setShowFilters(!showFilters)}
              >
                <ListFilter className="h-4 w-4" />
                <span>Filtros</span>
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Contenedor de filtros (siempre visible en desktop, condicional en móvil) */}
            <div
              className={`${
                showFilters ? "flex" : "hidden"
              } md:flex flex-col md:flex-row gap-1 w-full md:w-auto`}
            >
              <button
                className={`px-3 py-2 text-sm rounded-l flex items-center justify-center gap-1 transition-colors border-2 ${
                  filterMode === "active"
                    ? "text-[#BF8D6B]"
                    : "bg-black hover:text-white"
                }`}
                style={
                  filterMode === "active"
                    ? { backgroundColor: "#000000ff", borderColor: "#BF8D6B" }
                    : { borderColor: "#BF8D6B", color: "#ffffffff" }
                }
                onMouseEnter={(e) => {
                  if (filterMode !== "active") {
                    e.currentTarget.style.backgroundColor = "#000000ff";
                    e.currentTarget.style.color = "#BF8D6B";
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterMode !== "active") {
                    e.currentTarget.style.backgroundColor = "black";
                    e.currentTarget.style.color = "#ffffffff";
                  }
                }}
                onClick={() => {
                  setFilterMode("active");
                  setShowFilters(false);
                }}
              >
                <span className="text-xs md:text-sm">Activos</span>
              </button>
              <button
                className={`px-3 py-2 text-sm flex items-center justify-center gap-1 transition-colors border-2 ${
                  filterMode === "inactive"
                    ? "text-[#BF8D6B]"
                    : "bg-black hover:text-white"
                }`}
                style={
                  filterMode === "inactive"
                    ? { backgroundColor: "#000000ff", borderColor: "#BF8D6B" }
                    : { borderColor: "#BF8D6B", color: "#ffffffff" }
                }
                onMouseEnter={(e) => {
                  if (filterMode !== "inactive") {
                    e.currentTarget.style.backgroundColor = "#000000ff";
                    e.currentTarget.style.color = "#BF8D6B";
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterMode !== "inactive") {
                    e.currentTarget.style.backgroundColor = "black";
                    e.currentTarget.style.color = "#ffffffff";
                  }
                }}
                onClick={() => {
                  setFilterMode("inactive");
                  setShowFilters(false);
                }}
              >
                <span className="text-xs md:text-sm">Inactivos</span>
              </button>
              <button
                className={`px-3 py-2 text-sm rounded-r flex items-center justify-center gap-1 transition-colors border-2 ${
                  filterMode === "all"
                    ? "text-[#BF8D6B]"
                    : "bg-black hover:text-white"
                }`}
                style={
                  filterMode === "all"
                    ? { backgroundColor: "#000000ff", borderColor: "#BF8D6B" }
                    : { borderColor: "#BF8D6B", color: "#ffffffff" }
                }
                onMouseEnter={(e) => {
                  if (filterMode !== "all") {
                    e.currentTarget.style.backgroundColor = "#000000ff";
                    e.currentTarget.style.color = "#BF8D6B";
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterMode !== "all") {
                    e.currentTarget.style.backgroundColor = "black";
                    e.currentTarget.style.color = "#ffffffff";
                  }
                }}
                onClick={() => {
                  setFilterMode("all");
                  setShowFilters(false);
                }}
              >
                <span className="text-xs md:text-sm">Todos</span>
              </button>
            </div>

            {/* Botones de acción a la derecha */}
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto ml-auto">
              <div className="flex flex-col md:flex-row gap-2 w-full">
                <button
                  className="px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black w-full md:w-auto"
                  style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#BF8D6B";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "black";
                    e.currentTarget.style.color = "#ffffffff";
                  }}
                  onClick={handleAsignarVendedor}
                  disabled={selectedUsers.length === 0}
                >
                  <span className="text-xs md:text-sm">Vendedor</span>
                </button>

                <button
                  className="px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black w-full md:w-auto"
                  style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#BF8D6B";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "black";
                    e.currentTarget.style.color = "#ffffffff";
                  }}
                  onClick={handleAsignarAdministrador}
                  disabled={selectedUsers.length === 0}
                >
                  <span className="text-xs md:text-sm">Administrador</span>
                </button>
              </div>

              <button
                className="px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black w-full md:w-auto"
                style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#BF8D6B";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "#ffffffff";
                }}
                onClick={() => setShowModal(true)}
              >
                <span className="text-xs md:text-sm">Agregar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto ">
          <div className="hidden md:block ">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-900">
                <tr>
                  <th className="w-8 px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === currentItems.length &&
                        currentItems.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                      style={{ accentColor: "#BF8D6B" }}
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nombre y Apellido
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-28">
                    Tipo de Usuario
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentItems.map((usuario, index) => (
                  <tr
                    key={usuario.id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                    } ${
                      !usuario.isActive ? "opacity-70" : ""
                    } hover:bg-gray-700 transition-colors group`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(usuario.id)}
                        onChange={() => toggleUserSelection(usuario.id)}
                        className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                        style={{ accentColor: "#BF8D6B" }}
                      />
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-200">
                      {usuario.usuario || "-"}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-200">
                      {usuario.nombre} {usuario.apellido}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-200">
                      <a
                        href={`mailto:${usuario.email}`}
                        className="text-[#BF8D6B] hover:underline"
                      >
                        {usuario.email}
                      </a>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-200">
                      {usuario.whatsapp ? (
                        <a
                          href={`https://wa.me/${usuario.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#BF8D6B] hover:underline"
                        >
                          {usuario.whatsapp}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          usuario.rol === "admin"
                            ? "bg-gray-700 text-gray-200"
                            : usuario.rol === "vendor"
                            ? "bg-gray-600 text-gray-200"
                            : "bg-gray-900 text-gray-200"
                        }`}
                      >
                        {usuario.rol === "admin"
                          ? "Administrador"
                          : usuario.rol === "vendor"
                          ? "Vendedor"
                          : "Común"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="px-2 py-1 rounded transition-colors border-2 bg-black hover:text-black text-xs"
                          style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#BF8D6B";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "black";
                            e.currentTarget.style.color = "#BF8D6B";
                          }}
                          onClick={() => setUsuarioEditar(usuario)}
                          title="Editar"
                        >
                          Editar
                        </button>

                        <button
                          className="px-2 py-1 rounded transition-colors border-2 text-xs"
                          style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                          onClick={() => borrarUsuario(usuario.id)}
                          title="Borrar"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#BF8D6B";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "black";
                            e.currentTarget.style.color = "#BF8D6B";
                          }}
                        >
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-2">
            {currentItems.map((usuario) => (
              <div
                key={usuario.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(usuario.id)}
                      onChange={() => toggleUserSelection(usuario.id)}
                      className="w-4 h-4 bg-gray-700 border-gray-600 rounded mr-1"
                      style={{ accentColor: "#BF8D6B" }}
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-200">
                        {usuario.nombre} {usuario.apellido}
                      </div>
                      <div className="text-sm text-gray-400">
                        {usuario.usuario || "-"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedUser(
                        expandedUser === usuario.id ? null : usuario.id
                      )
                    }
                    className="text-gray-400 hover:text-gray-300 flex items-center gap-1 text-sm transition-colors"
                  >
                    {expandedUser === usuario.id ? (
                      <>
                        <span>Cerrar</span>
                        <ChevronUp className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        <span>Detalles</span>
                        <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </button>
                </div>

                {expandedUser === usuario.id && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-gray-700">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-sm">Email:</span>
                        <a
                          href={`mailto:${usuario.email}`}
                          className="break-words text-sm text-[#BF8D6B] hover:underline"
                        >
                          {usuario.email}
                        </a>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-sm">Teléfono:</span>
                        {usuario.whatsapp ? (
                          <a
                            href={`https://wa.me/${usuario.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-words text-sm text-[#BF8D6B] hover:underline"
                          >
                            {usuario.whatsapp}
                          </a>
                        ) : (
                          <span className="break-words text-sm text-gray-200">
                            -
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-sm">Rol:</span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit mt-1 ${
                            usuario.rol === "admin"
                              ? "bg-gray-700 text-gray-200"
                              : usuario.rol === "vendor"
                              ? "bg-gray-600 text-gray-200"
                              : "bg-gray-900 text-gray-200"
                          }`}
                        >
                          {usuario.rol === "admin"
                            ? "Administrador"
                            : usuario.rol === "vendor"
                            ? "Vendedor"
                            : "Común"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2 mt-2 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <button
                          className="p-2 rounded transition-colors flex items-center justify-center border-2 bg-black hover:text-black text-xs"
                          style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#BF8D6B";
                            e.currentTarget.style.color = "black";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "black";
                            e.currentTarget.style.color = "#BF8D6B";
                          }}
                          onClick={() => setUsuarioEditar(usuario)}
                        >
                          Editar
                        </button>
                        <button
                          className="p-2 rounded transition-colors flex items-center justify-center border-2 text-xs"
                          style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                          onClick={() => borrarUsuario(usuario.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#BF8D6B";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "black";
                            e.currentTarget.style.color = "#BF8D6B";
                          }}
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {usuariosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No se encontraron usuarios</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-1">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`px-3 py-2 text-sm rounded transition-colors border-2 ${
                  currentPage === index + 1
                    ? "text-black"
                    : "bg-black hover:text-black"
                }`}
                style={
                  currentPage === index + 1
                    ? { backgroundColor: "#BF8D6B", borderColor: "#BF8D6B" }
                    : { borderColor: "#BF8D6B", color: "#BF8D6B" }
                }
                onMouseEnter={(e) => {
                  if (currentPage !== index + 1) {
                    e.currentTarget.style.backgroundColor = "#BF8D6B";
                    e.currentTarget.style.color = "black";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== index + 1) {
                    e.currentTarget.style.backgroundColor = "black";
                    e.currentTarget.style.color = "#BF8D6B";
                  }
                }}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            {currentPage < totalPages && (
              <button
                className="px-3 py-2 text-sm rounded transition-colors border-2 bg-black hover:text-black"
                style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#BF8D6B";
                  e.currentTarget.style.color = "black";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "#BF8D6B";
                }}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {showModal && (
          <UsuarioModal
            onClose={() => setShowModal(false)}
            onSave={agregarUsuario}
          />
        )}

        {usuarioEditar && (
          <UsuarioEditarModal
            usuario={usuarioEditar}
            onClose={() => setUsuarioEditar(null)}
            onSave={modificarUsuario}
          />
        )}
      </div>
    </div>
  );
}
