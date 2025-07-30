import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Seam Carving IDE
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
          <p className="text-gray-600 mb-4">
            This IDE will help you experiment with seam carving algorithms 
            to resize images intelligently.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-blue-800">
              🚧 Under construction - we'll build this step by step!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

