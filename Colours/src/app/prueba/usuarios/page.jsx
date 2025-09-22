"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import { useAuth0 } from "@auth0/auth0-react";
import Swal from "sweetalert2";

// Componentes modulares
import Header from "../components/header";
import UsuarioModal from "../components/componentes-usuario-modal/usuario-modal";
import UsuarioEditarModal from "../components/componentes-usuario-editar-modal/usuario-editar-modal";
import SearchBar from "../components/componentes-usuarios/SearchBar";
import FilterButtons from "../components/componentes-usuarios/FilterButtons";
import ActionButtons from "../components/componentes-usuarios/ActionButtons";
import UsersTable from "../components/componentes-usuarios/UsersTable";
import MobileUsersList from "../components/componentes-usuarios/MobileUsersList";
import Pagination from "../components/componentes-usuarios/Pagination";

// Hooks personalizados
import { useUsers } from "./hook/useUsers";
import { useUserSelection } from "./hook/useUserSelection";
import { useUserActions } from "./hook/useUserActions";

// Utils
import { removeAccents } from "./utils/stringUtils";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

export default function Usuarios() {
  const { authData, setAuthData } = useContext(AuthContext);
  const { logout } = useAuth0();
  const router = useRouter();

  // Estados
  const [isClient, setIsClient] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [filterMode, setFilterMode] = useState("active");
  const [busqueda, setBusqueda] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Hooks personalizados
  const { usuarios, loading, error, fetchUsuarios } = useUsers(
    API_URL,
    filterMode,
    isClient
  );
  const {
    selectedUsers,
    toggleUserSelection,
    toggleSelectAll,
    setSelectedUsers,
  } = useUserSelection();
  const {
    handleAsignarAdministrador,
    handleAsignarVendedor,
    changeUserStatus,
    agregarUsuario,
    modificarUsuario,
    borrarUsuario,
  } = useUserActions(
    API_URL,
    selectedUsers,
    authData,
    fetchUsuarios,
    setSelectedUsers,
    setShowModal,
    setUsuarioEditar
  );

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

  // Filtrado de usuarios
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

  const itemsPerPage = 10;
  const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage);
  const currentItems = usuariosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!isClient) return null;

  return (
    <div className="p-2 md:p-4">
      <div className="mb-4 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
          <SearchBar busqueda={busqueda} setBusqueda={setBusqueda} />

          <div className="flex flex-wrap gap-2 md:gap-2">
            <FilterButtons
              filterMode={filterMode}
              setFilterMode={setFilterMode}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />

            <ActionButtons
              selectedUsers={selectedUsers}
              handleAsignarVendedor={handleAsignarVendedor}
              handleAsignarAdministrador={handleAsignarAdministrador}
              setShowModal={setShowModal}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="hidden md:block">
            <UsersTable
              currentItems={currentItems}
              selectedUsers={selectedUsers}
              toggleUserSelection={toggleUserSelection}
              toggleSelectAll={toggleSelectAll}
              setUsuarioEditar={setUsuarioEditar}
              borrarUsuario={borrarUsuario}
              isCurrentUser={isCurrentUser}
            />
          </div>

          <div className="md:hidden">
            <MobileUsersList
              currentItems={currentItems}
              selectedUsers={selectedUsers}
              toggleUserSelection={toggleUserSelection}
              expandedUser={expandedUser}
              setExpandedUser={setExpandedUser}
              setUsuarioEditar={setUsuarioEditar}
              borrarUsuario={borrarUsuario}
            />
          </div>
        </div>

        {usuariosFiltrados.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No se encontraron usuarios</p>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
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
