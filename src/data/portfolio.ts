export type PortfolioItem = {
  image: string;
  logo: string;
  logoAlt: string;
  title: string;
  description: string;
};

export const portfolioItems: PortfolioItem[] = [
  {
    image: "/images/digital-signage.png",
    logo: "/images/logos/freespace.png",
    logoAlt: "Freespace logo",
    title: "Freespace | Digital Signage",
    description:
      "Digital wayfinding system for office spaces with desk and room booking.",
  },
  {
    image: "/images/Bike rent.png",
    logo: "/images/logos/bike.png",
    logoAlt: "Bike Rent logo",
    title: "Bike Rent | Booking Platform",
    description:
      "Seamless bike rental experience with location-based search, date selection and bike type filtering across multiple locations.",
  },
  {
    image: "/images/Motr book.png",
    logo: "/images/logos/motr.png",
    logoAlt: "MOTR logo",
    title: "MOTR | Service Booking",
    description:
      "Comprehensive service booking interface for vehicle maintenance with multiple service tier options and scheduling.",
  },
  {
    image: "/images/eptura-app.png",
    logo: "/images/logos/eptura.png",
    logoAlt: "Eptura logo",
    title: "Eptura | Workspace Management",
    description:
      "Enterprise workspace booking and management platform for office coordination and resource allocation.",
  },
  {
    image: "/images/Motr garage.png",
    logo: "/images/logos/motr.png",
    logoAlt: "MOTR logo",
    title: "MOTR | Garage Management",
    description:
      "Booking management app to help garage owners stay in control of their schedule.",
  },
  {
    image: "/images/Acala.png",
    logo: "/images/logos/acala.png",
    logoAlt: "Acala logo",
    title: "Acala | DeFi Protocol Interface",
    description:
      "Cryptocurrency minting platform for Acala aUSD, featuring deposit management and risk controls for DeFi users.",
  },
  {
    image: "/images/Utilisation.png",
    logo: "/images/logos/condeco.png",
    logoAlt: "Condeco logo",
    title: "Condeco | Utilisation Dashboard",
    description:
      "Analytics dashboard tracking space utilisation and occupancy rates.",
  },
  {
    image: "/images/easy-money.png",
    logo: "/images/logos/easymoney.png",
    logoAlt: "easyMoney logo",
    title: "easyMoney | Mobile Banking",
    description:
      "Modern fintech mobile app with multi-currency support, account management and seamless payment integration.",
  },
];
