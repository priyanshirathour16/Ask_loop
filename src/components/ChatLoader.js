const ChatLoader = () => {
    return (
      <div className="flex flex-col gap-1 px-1 w-full  mx-auto">
        {/* Left Message */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="bg-gray-300 animate-pulse w-2/3 h-6 rounded-lg"></div>
        </div>
  
        {/* Right Message */}
        <div className="flex items-center gap-2 justify-end">
          <div className="bg-gray-300 animate-pulse w-2/3 h-6 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
  
        {/* Left Message */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="bg-gray-300 animate-pulse w-1/2 h-6 rounded-lg"></div>
        </div>
  
        {/* Right Message */}
        <div className="flex items-center gap-2 justify-end">
          <div className="bg-gray-300 animate-pulse w-1/2 h-6 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  };
  
  export default ChatLoader;