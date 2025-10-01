// theme.ts
export const brandTheme = {
  colors: {
    primary: "#460F58",         // Heading / Main Brand
    secondary: "#7B53A6",       // Accent / Buttons / Highlights
    supportive: "#744D81",      // Subheadings, section dividers
    text: "#390F59",            // Body text / strong emphasis
    mutedText: "#7B53A6",       // Captions / meta info
    backgroundLight: "#F7FBFB", // Page & card backgrounds
    border: "#E5E7EB",          // Default border
    borderHover: "#7B53A6",     // Card / button hover
  },
  button: {
    primary: {
      bg: "#7B53A6",
      text: "#F7FBFB",
      hoverBg: "#460F58",
    },
    secondary: {
      bg: "#F7FBFB",
      border: "#7B53A6",
      text: "#7B53A6",
      hoverBg: "#744D81",
      hoverText: "#F7FBFB",
    },
  },
  card: {
    bg: "#F7FBFB",
    border: "#E0E0E0",
    hoverBorder: "#7B53A6",
    shadowHover: "rgba(123, 83, 166, 0.25)",
    title: "#460F58",
    description: "#390F59",
    icon: "#7B53A6",
  },
};
