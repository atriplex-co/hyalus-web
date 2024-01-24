<template>
  <div
    v-if="itemsTest"
    ref="items"
    class="pointer-events-none absolute left-[100vw] top-[100vw] w-48 p-2 opacity-0"
  >
    <!-- used for computing height -->
    <slot />
  </div>
  <Teleport to="#app-inner">
    <Transition
      enter-active-class="transition ease-out duration-100 origin-top-left"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75 origin-top-left"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed z-50 w-48 rounded-md bg-ctp-crust p-2 text-sm shadow-md"
        :style="style"
        @mouseup.stop
        @contextmenu.prevent
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, ref, type Ref } from "vue";

export default defineComponent({
  setup() {
    return {
      items: ref(null) as Ref<HTMLDivElement | null>,
    };
  },
  data() {
    return {
      isOpen: false,
      style: "",
      itemsTest: false,
    };
  },
  methods: {
    async open(e: MouseEvent) {
      e.preventDefault();

      this.itemsTest = true;
      await this.$nextTick();
      const height = this.items!.clientHeight;
      this.itemsTest = false;

      this.style = "";
      if (innerWidth - e.x > 192) {
        this.style += `left:${e.x}px;`;
      } else {
        this.style += `right:${innerWidth - e.x}px;`;
      }
      if (innerHeight - e.y > height) {
        this.style += `top:${e.y}px;`;
      } else {
        this.style += `bottom:${innerHeight - e.y}px;`;
      }

      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
    onMouseUp() {
      this.close();
    },
  },
  mounted() {
    addEventListener("mouseup", this.onMouseUp);
  },
  unmounted() {
    removeEventListener("mouseup", this.onMouseUp);
  },
});
</script>
