const UserTableLoading = () => {
    return (
      <div className="mx-auto">
        <table className=" container mx-auto border border-gray-300">
          <thead>
            <tr className="bg-blue-100">
              {['Ref Id', 'Ask For Scope Id', 'Client Name', 'Status', 'Service', 'Currency', 'RC Demo', 'Created Date', 'Actions'].map((header, index) => (
                <th key={index} className="px-4 py-2 text-left border-b">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, rowIndex) => (
              <tr key={rowIndex} className="animate-pulse">
                {[...Array(8)].map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 border-b">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                  </td>
                ))}
                <td className="px-4 py-3 border-b">
                  <div className="h-8 bg-blue-300 rounded w-20"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default UserTableLoading;
  