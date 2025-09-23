import Swal from "sweetalert2";

export const useUserActions = (
  API_URL,
  selectedUsers,
  authData,
  fetchUsuarios,
  setSelectedUsers,
  setShowModal,
  setShowGraduadoModal,
  setUsuarioEditar
) => {
  const isCurrentUser = (userId) => {
    return authData?.user?.id === userId;
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
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al asignar roles",
        text: error.message || "Ocurrió un error al asignar los roles",
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
        throw new Error(`Error al ${actionText} el usuario`);
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
      });
    }
  };

  const agregarUsuario = async (nuevoUsuario) => {
    try {
      const response = await fetch(`${API_URL}/api/users/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...nuevoUsuario,
          rol: nuevoUsuario.rol || "comun",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear usuario");
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
        text: error.message,
      });
    }
  };

  const agregarGraduado = async (nuevoGraduado) => {
    try {
      const response = await fetch(`${API_URL}/api/users/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...nuevoGraduado,
          rol: "graduado",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear usuario graduado");
      }

      await fetchUsuarios();
      setShowGraduadoModal(false);
      Swal.fire({
        icon: "success",
        title: "Graduado creado",
        text: "El usuario graduado fue creado correctamente",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al crear graduado",
        text: error.message,
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
        throw new Error("Error al modificar usuario");
      }

      await fetchUsuarios();

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Los datos del usuario se actualizaron correctamente",
        timer: 2000,
        showConfirmButton: false,
      });

      setUsuarioEditar(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
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
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al eliminar el usuario");
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
        });
      }
    }
  };

  return {
    handleAsignarAdministrador,
    handleAsignarVendedor,
    changeUserStatus,
    agregarUsuario,
    agregarGraduado,
    modificarUsuario,
    borrarUsuario,
  };
};
