import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
      },
    },
  },
  colors: {
    brand: {
      50: "#e6f6ff",
      100: "#b3e0ff",
      200: "#80cbff",
      300: "#4db5ff",
      400: "#1a9fff",
      500: "#0080ff",
      600: "#0066cc",
      700: "#004d99",
      800: "#003366",
      900: "#001a33",
    },
    accent: {
      50: "#fff5e6",
      100: "#ffe0b3",
      200: "#ffcc80",
      300: "#ffb84d",
      400: "#ffa31a",
      500: "#ff8c00",
      600: "#cc7000",
      700: "#995400",
      800: "#663800",
      900: "#331c00",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "medium",
        borderRadius: "md",
        _hover: {
          transform: "translateY(-1px)",
          boxShadow: "sm",
        },
        _active: {
          transform: "translateY(0)",
        },
      },
      variants: {
        solid: (props: { colorScheme: string }) => ({
          bg: `${props.colorScheme}.500`,
          color: "white",
          _hover: {
            bg: `${props.colorScheme}.600`,
          },
        }),
        outline: (props: { colorScheme: string }) => ({
          border: "1px solid",
          borderColor: `${props.colorScheme}.500`,
          color: `${props.colorScheme}.500`,
          _hover: {
            bg: `${props.colorScheme}.50`,
          },
        }),
        ghost: (props: { colorScheme: string }) => ({
          color: `${props.colorScheme}.500`,
          _hover: {
            bg: `${props.colorScheme}.50`,
          },
        }),
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "md",
          _focus: {
            boxShadow: "0 0 0 1px brand.500",
          },
        },
      },
      variants: {
        outline: {
          field: {
            border: "1px solid",
            borderColor: "gray.200",
            _hover: {
              borderColor: "gray.300",
            },
            _focus: {
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px brand.500",
            },
          },
        },
      },
    },
    Box: {
      baseStyle: {
        borderRadius: "md",
      },
    },
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});

export default customTheme;