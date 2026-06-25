import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { type KnowledgeGraphData, type KnowledgeNode } from "../api/knowledgeApi";

type Props = {
  data: KnowledgeGraphData;
  onNodeClick: (node: KnowledgeNode) => void;
  width: number;
  height: number;
  bgMode?: "universe" | "blueprint" | "paper";
};

export function KnowledgeGraph({ data, onNodeClick, width, height, bgMode = "universe" }: Props) {
  const fgRef = useRef<any>();
  const [hoverNode, setHoverNode] = useState<KnowledgeNode | null>(null);

  useEffect(() => {
    if (fgRef.current) {
      // Adjust physics to spread nodes out more to prevent text overlap
      fgRef.current.d3Force('charge').strength(-800); // Strong repulsion
      fgRef.current.d3Force('link').distance(120); // Longer links

      setTimeout(() => {
        fgRef.current.zoomToFit(600, 50);
      }, 500);
    }
  }, [data]);

  const getNodeColor = (node: KnowledgeNode) => {
    const colors = [
      "#6B5DD3", // Purple
      "#38B2AC", // Teal
      "#F56565", // Red
      "#ED8936", // Orange
      "#ECC94B", // Yellow
      "#4299E1", // Blue
    ];
    const index = (node.group - 1) % colors.length;
    return hoverNode === node ? (bgMode === "paper" ? "#000000" : "#FFFFFF") : colors[index];
  };

  const getContainerStyles = () => {
    if (bgMode === "blueprint") {
      return {
        className: "relative overflow-hidden rounded-3xl shadow-2xl bg-slate-900 border border-slate-800",
        style: {
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }
      };
    }
    if (bgMode === "paper") {
      return {
        className: "relative overflow-hidden rounded-3xl shadow-2xl bg-[#fdfbf7] border border-slate-200",
        style: {
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }
      };
    }
    return {
      className: "relative overflow-hidden rounded-3xl shadow-2xl bg-[#090a0f] border border-slate-800",
      style: undefined
    };
  };

  const containerProps = getContainerStyles();

  return (
    <div {...containerProps}>
      {/* Universe background effect */}
      {bgMode === "universe" && (
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      )}
      
      <ForceGraph2D
        ref={fgRef}
        width={width}
        height={height}
        graphData={data}
        nodeLabel="" // Custom drawing below
        nodeColor={getNodeColor as any}
        nodeRelSize={hoverNode ? 10 : 8}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkColor={(link: any) => {
          const isHovered = hoverNode && (link.source === hoverNode || link.target === hoverNode);
          if (bgMode === "paper") {
            return isHovered ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.15)";
          }
          return isHovered ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.15)";
        }}
        linkWidth={(link: any) => 
          (hoverNode && (link.source === hoverNode || link.target === hoverNode)) ? 2 : 1
        }
        backgroundColor="transparent"
        onNodeHover={(node) => {
          setHoverNode(node as KnowledgeNode | null);
          const canvas = fgRef.current?.canvas || document.body;
          if (canvas) {
            canvas.style.cursor = node ? 'pointer' : 'default';
          }
        }}
        onNodeClick={(node) => {
          onNodeClick(node as KnowledgeNode);
          if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(1.5, 1000);
          }
        }}
        nodeCanvasObjectMode={() => "replace"}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const isHover = hoverNode === node;
          
          // 1. Draw the Node Circle prominently
          // We scale the radius inversely with globalScale so it doesn't get too tiny when zoomed out
          const baseRadius = isHover ? 10 : 7;
          const nodeRadius = baseRadius / Math.pow(globalScale, 0.5); 
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
          ctx.fillStyle = getNodeColor(node as KnowledgeNode);
          
          // Add glow on hover
          if (isHover) {
             ctx.shadowColor = ctx.fillStyle;
             ctx.shadowBlur = 15;
             ctx.fill();
             ctx.shadowBlur = 0; // reset
          } else {
             ctx.fill();
          }

          // 2. Draw the Text Label below the node
          const label = node.title;
          const fontSize = (isHover ? 16 : 14) / globalScale;
          ctx.font = `${isHover ? 'bold ' : ''}${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          const textY = node.y + nodeRadius + (10 / globalScale);
          
          // Draw text background pill for better readability
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth + 10 / globalScale, fontSize + 6 / globalScale];
          
          if (bgMode === "paper") {
             ctx.fillStyle = isHover ? "rgba(10, 15, 30, 0.9)" : "rgba(255, 255, 255, 0.9)";
          } else {
             ctx.fillStyle = isHover ? "rgba(255, 255, 255, 0.9)" : "rgba(10, 15, 30, 0.7)";
          }

          ctx.beginPath();
          ctx.roundRect(
            node.x - bckgDimensions[0] / 2,
            textY - bckgDimensions[1] / 2,
            bckgDimensions[0],
            bckgDimensions[1],
            4 / globalScale
          );
          ctx.fill();

          // Draw text
          if (bgMode === "paper") {
            ctx.fillStyle = isHover ? "#FFFFFF" : "rgba(0, 0, 0, 0.9)";
          } else {
            ctx.fillStyle = isHover ? "#000000" : "rgba(255, 255, 255, 0.9)";
          }
          ctx.fillText(label, node.x, textY);
        }}
      />
    </div>
  );
}
