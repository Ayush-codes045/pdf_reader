import FileUploadComponent from './components/file-upload';
import ChatComponent from './components/chat';
export default function Home() {
  return (
    <div>
      <div className="min-h-[calc(100vh-80px)] h-[calc(100vh-80px)] w-screen flex">
        <div className="w-[30vw] min-h-full p-4 flex justify-center items-center">
          <FileUploadComponent />
        </div>
        <div className="w-[70vw] min-h-full h-full border-l-2 flex flex-col">
          <ChatComponent />
        </div>
      </div>
    </div>
  );
}