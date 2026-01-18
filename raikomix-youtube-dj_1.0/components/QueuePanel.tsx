@@ -36,100 +36,101 @@ const MarqueeText: React.FC<{ text: string; className: string }> = ({ text, clas
 
 const QueuePanel: React.FC<QueuePanelProps> = ({ queue, onLoadToDeck, onRemove, onClear, onReorder }) => {
   return (
     <div className="flex flex-col h-full gap-4 elevation-2">
       <div className="flex items-center justify-between px-2">
         <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Play Queue ({queue.length})</h3>
         {queue.length > 0 && (
          <div className="flex items-center gap-2">
             <button
               onClick={() => exportQueue(queue)}
               className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
               title="Export Queue JSON"
             >
               <span className="material-symbols-outlined text-sm">download</span>
             </button>
             <button 
               onClick={onClear}
               className="text-[10px] font-bold text-red-400/60 hover:text-red-400 uppercase tracking-tighter motion-standard"
             >
               Clear All
             </button>
           </div>
         )}
       </div>
 
-      <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
+      {/* UX rationale: compact row height and always-visible controls reduce missed taps during quick mixing. */}
+      <div className="flex-1 overflow-y-auto pr-2 space-y-1.5 scrollbar-hide">
         {queue.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
             <span className="material-symbols-outlined text-4xl mb-2">queue_music</span>
             <p className="text-xs uppercase tracking-widest font-bold">Queue is empty</p>
           </div>
         )}
 
         {queue.map((item, index) => (
-          <div key={item.id} className="m3-card group p-3 flex gap-4 items-center bg-[#1C1B1F]/40 hover:bg-[#2B2930] motion-standard border-dashed elevation-1 hover:elevation-2 overflow-hidden">
-            <div className="flex flex-col items-center gap-1">
+          <div key={item.id} className="m3-card p-2 flex gap-2 items-center bg-[#1C1B1F]/40 hover:bg-[#2B2930] motion-standard border-dashed elevation-1 hover:elevation-2 overflow-hidden">
+            <div className="flex flex-col items-center gap-0.5">
               <button
                 type="button"
                 onClick={() => onReorder(index, index - 1)}
                 disabled={index === 0}
-                className="w-6 h-6 rounded-full text-gray-500 hover:text-white disabled:opacity-30"
+                className="w-5 h-5 rounded-full text-gray-500 hover:text-white disabled:opacity-30"
                 aria-label={`Move ${item.title} up`}
               >
                 <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
               </button>
-              <span className="text-[10px] font-mono text-gray-600 w-4 text-center">{index + 1}</span>
+              <span className="text-[9px] font-mono text-gray-600 w-4 text-center">{index + 1}</span>
               <button
                 type="button"
                 onClick={() => onReorder(index, index + 1)}
                 disabled={index === queue.length - 1}
-                className="w-6 h-6 rounded-full text-gray-500 hover:text-white disabled:opacity-30"
+                className="w-5 h-5 rounded-full text-gray-500 hover:text-white disabled:opacity-30"
                 aria-label={`Move ${item.title} down`}
               >
                 <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
               </button>
             </div>
-            <div className="w-12 h-12 bg-black rounded overflow-hidden flex-shrink-0 elevation-1">
+            <div className="w-10 h-10 bg-black rounded overflow-hidden flex-shrink-0 elevation-1">
               <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
             </div>
             <div className="flex-1 min-w-0 flex flex-col gap-1 overflow-hidden">
               <MarqueeText 
                 text={item.title} 
-                className="text-sm font-semibold text-[#E6E1E5] leading-tight" 
+                className="text-[11px] font-semibold text-[#E6E1E5] leading-tight" 
               />
               <MarqueeText 
                 text={item.author || 'Unknown Artist'} 
-                className="text-[10px] text-gray-400 font-medium" 
+                className="text-[9px] text-gray-400 font-medium" 
               />
             </div>
-            <div className="flex gap-1 opacity-0 group-hover:opacity-100 motion-standard">
+            <div className="flex gap-1 motion-standard">
               <button 
                 onClick={() => onLoadToDeck(item, 'A')}
-                className="px-2 py-1 rounded bg-[#D0BCFF]/10 text-[#D0BCFF] text-[10px] font-black motion-emphasized elevation-1 hover:elevation-2"
+                className="px-2 py-1 rounded bg-[#D0BCFF]/10 text-[#D0BCFF] text-[9px] font-black motion-emphasized elevation-1 hover:elevation-2"
                 aria-label={`Load ${item.title} to Deck A`}
               >
                 A
               </button>
               <button 
                 onClick={() => onLoadToDeck(item, 'B')}
-                className="px-2 py-1 rounded bg-[#F2B8B5]/10 text-[#F2B8B5] text-[10px] font-black motion-emphasized elevation-1 hover:elevation-2"
+                className="px-2 py-1 rounded bg-[#F2B8B5]/10 text-[#F2B8B5] text-[9px] font-black motion-emphasized elevation-1 hover:elevation-2"
                 aria-label={`Load ${item.title} to Deck B`}
               >
                 B
               </button>
               <button 
                 onClick={() => onRemove(item.id)}
-                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-400 motion-standard"
+                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:text-red-400 motion-standard"
                 aria-label={`Remove ${item.title} from queue`}
               >
                 <span className="material-symbols-outlined text-lg">close</span>
               </button>
             </div>
           </div>
         ))}
       </div>
     </div>
   );
 };
 
 export default QueuePanel;
