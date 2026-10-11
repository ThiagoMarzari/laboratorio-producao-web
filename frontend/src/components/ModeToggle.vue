<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'
import { useColorMode } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// `store` guarda a escolha ('light' | 'dark' | 'auto') no localStorage;
// o useColorMode aplica a classe `dark` no <html>.
const { store } = useColorMode()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="icon" class="relative">
        <Sun class="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon class="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span class="sr-only">Alternar tema</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuRadioGroup v-model="store">
        <DropdownMenuRadioItem value="light">Claro</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark">Escuro</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="auto">Sistema</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
