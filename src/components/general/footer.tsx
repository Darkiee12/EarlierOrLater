const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center text-sm text-gray-500 dark:text-gray-400">
      <div className="flex flex-col gap-1 mx-auto px-4">
        <p>
          Historical data sourced from{" "}
          <a 
            href="https://wikimediafoundation.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Wikimedia Foundation
          </a>
          {" "}via the Wikipedia API.
        </p>
        <p className="text-xs">
          This game is an independent project and is not affiliated with, endorsed by, 
          or sponsored by the Wikimedia Foundation or Wikipedia. All trademarks are the property of their respective owners.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
