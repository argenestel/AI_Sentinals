import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "white",
      },
    },
  },
  colors: {
    brand: {
      50: "#e0f7ff",
      100: "#b8e4ff",
      200: "#8cd2ff",
      300: "#5ebfff",
      400: "#30adff",
      500: "#1793e6",
      600: "#0073b4",
      700: "#005482",
      800: "#003651",
      900: "#001821",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "md",
        _hover: {
          transform: "translateY(-2px)",
          boxShadow: "lg",
        },
        _active: {
          transform: "translateY(0)",
        },
      },
      variants: {
        solid: (props: { colorScheme: any; }) => ({
          bg: `${props.colorScheme}.500`,
          color: "white",
          _hover: {
            bg: `${props.colorScheme}.600`,
          },
        }),
        outline: (props: { colorScheme: any; }) => ({
          border: "2px solid",
          borderColor: `${props.colorScheme}.500`,
          color: `${props.colorScheme}.500`,
          _hover: {
            bg: `${props.colorScheme}.500`,
            color: "white",
          },
        }),
        ghost: (props: { colorScheme: any; }) => ({
          color: `${props.colorScheme}.500`,
          _hover: {
            bg: `${props.colorScheme}.100`,
          },
        }),
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "md",
          _focus: {
            boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
          },
        },
      },
      variants: {
        outline: {
          field: {
            border: "2px solid",
            borderColor: "gray.300",
            _hover: {
              borderColor: "gray.400",
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
    heading: "'Cinzel', serif",
    body: "'Raleway', sans-serif",
  },
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

export default customTheme;