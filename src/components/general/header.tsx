import Link from "next/link";
import { BRAND_NAME } from "@/common/constants";

const Header = () => {
  return (
    <header className="w-full py-4 text-center">
      <Link href="/" className="no-underline">
        <h1 className="text-2xl font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {BRAND_NAME} - Historical Events Timeline Game
        </h1>
      </Link>
    </header>
  );
};

export default Header;
