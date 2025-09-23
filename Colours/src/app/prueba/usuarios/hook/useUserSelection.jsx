// useUserSelection hook
import { useState } from "react";

export const useUserSelection = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUserSelection = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (currentItems) => {
    if (selectedUsers.length === currentItems.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentItems.map((user) => user.id));
    }
  };

  return {
    selectedUsers,
    toggleUserSelection,
    toggleSelectAll,
    setSelectedUsers,
  };
};
