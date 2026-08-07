export default function ChatBox() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-6">
        <h2 className="text-white text-2xl font-bold text-center">
          Chat Room 💬
        </h2>

        <div className="mt-6 h-80 bg-gray-800 rounded-xl p-4 text-gray-400">
          لا توجد رسائل بعد...
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2"
            placeholder="اكتب رسالة..."
          />

          <button className="bg-blue-600 text-white px-4 rounded-lg">
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}