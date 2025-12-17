// frontend/src/stores/menu.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchMyMenus, type MenuNode } from "@/api/menu";

export const useMenuStore = defineStore("menu", () => {
  const menus = ref<MenuNode[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const loadMenus = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetchMyMenus();
      menus.value = response.data;
    } catch (err) {
      console.error("Failed to load menus:", err);
      error.value = "메뉴를 불러오는데 실패했습니다.";
    } finally {
      isLoading.value = false;
    }
  };

  return {
    menus,
    isLoading,
    error,
    loadMenus,
  };
});
