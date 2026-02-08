const TableLoader = () => {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        {/* Buttons */}
        <div className="flex gap-3 mb-4">
          <div className="w-28 h-9 bg-gray-300 rounded-lg animate-pulse"></div>
          <div className="w-36 h-9 bg-gray-300 rounded-lg animate-pulse"></div>
          <div className="w-36 h-9 bg-gray-300 rounded-lg animate-pulse"></div>
        </div>
  
        {/* Search and Entries */}
        <div className="flex justify-between items-center mb-4">
          <div className="w-20 h-8 bg-gray-300 rounded-md animate-pulse"></div>
          <div className="w-48 h-8 bg-gray-300 rounded-md animate-pulse"></div>
        </div>
  
        {/* Table */}
        <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex bg-gray-200 p-3 animate-pulse space-x-2">
            <div className="w-1/12 h-5 bg-gray-300 rounded"></div>
            <div className="w-2/12 h-5 bg-gray-300 rounded"></div>
            <div className="w-3/12 h-5 bg-gray-300 rounded"></div>
            <div className="w-2/12 h-5 bg-gray-300 rounded"></div>
            <div className="w-2/12 h-5 bg-gray-300 rounded"></div>
            <div className="w-2/12 h-5 bg-gray-300 rounded"></div>
          </div>
  
          {/* Rows */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex p-3 border-b border-gray-300 animate-pulse space-x-2">
              <div className="w-1/12 h-5 bg-gray-300 rounded"></div>
              <div className="w-2/12 h-5 bg-gray-300 rounded"></div>
              <div className="w-3/12 h-5 bg-gray-300 rounded"></div>
              <div className="w-2/12 h-5 bg-gray-300 rounded"></div>
              <div className="w-2/12 h-5 bg-gray-300 rounded"></div>
              <div className="w-2/12 h-8 bg-gray-300 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default TableLoader;
  