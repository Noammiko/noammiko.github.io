<script>
    /** @type {{ 
     * classNames: string, 
     * width: number,
     * height:number, 
     * cornerRadius:number,
     * lineLength:number, 
     * lineWidth:number, 
     * lineColour:string, 
     * revolutionTimeSeconds:number, 
     * showPath: bool
     * borderColour:string, 
     * children:Snippet 
     * }} */
    let {
        classNames = "bg-white",
        width = 300,
        height = 200,
        cornerRadius = 20,
        lineLength = 15,
        lineWidth = 4,
        lineColour = "#3B82F6",
        revolutionTimeSeconds = 2,
        showPath = true,
        borderColour = "rgb(229 231 235)",
        children,
    } = $props();

    // Create the path that follows the rounded rectangle, have it be derived so it can change on the fly
    // line is also stroke-alignement: inner
    const roundedRectPath = $derived(`
      M ${cornerRadius + lineWidth/2} ${lineWidth/2}
      H ${width - cornerRadius - lineWidth/2}
      A ${cornerRadius} ${cornerRadius} 0 0 1 ${width - lineWidth/2} ${cornerRadius + lineWidth/2}
      V ${height - cornerRadius - lineWidth/2}
      A ${cornerRadius} ${cornerRadius} 0 0 1 ${width - cornerRadius - lineWidth/2} ${height - lineWidth/2}
      H ${cornerRadius + lineWidth/2}
      A ${cornerRadius} ${cornerRadius} 0 0 1 ${lineWidth/2} ${height - cornerRadius - lineWidth/2}
      V ${cornerRadius + lineWidth/2}
      A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius + lineWidth/2} ${lineWidth/2}
    `);

    // Calculate total path length for proper dash sizing
    const pathLength = $derived(
        2 * (width + height - 2 * lineWidth) - 8 * cornerRadius + 2 * Math.PI * cornerRadius,
    );
    const dashLength = $derived((pathLength * lineLength) / 100);
    
    let container;
    $effect(()=>{
        if (!container) return;
        const smap = window.getComputedStyle(container);
        
        cornerRadius = parseFloat(smap.borderRadius);
    })
</script>

<div class="relative {classNames}"
bind:clientHeight={height}
bind:clientWidth={width}
bind:this={container}
>
    <!-- Container div with rounded corners and path -->
    <div
        class="absolute inset-0 bg-transparent"
        style:border-radius={cornerRadius+"px"}
        style:border-width={lineWidth+"px"}
        style:border-color={showPath?borderColour:"transparent"}
    >
    </div>

    <div>
        {#if children}
            {@render children()}        
        {/if}
    </div>

    <!-- SVG Spinner -->
    <svg class="absolute inset-0" {width} {height} style:overflow="visible">
        <!-- Animated line segment -->
        <path
            d={roundedRectPath}
            fill="none"
            stroke={lineColour}
            stroke-width={lineWidth}
            stroke-linecap="round"
            style:--dashoffset={pathLength}
            style:stroke-dasharray="{dashLength} {pathLength - dashLength}"
            style:animation="spin {revolutionTimeSeconds}s linear infinite"
        />

        <!-- Add the required keyframe animation -->
        <style>
            @keyframes spin {
                from {
                    stroke-dashoffset: var(--dashoffset);
                }
                to {
                    stroke-dashoffset: 0;
                }
            }
        </style>
    </svg>
</div>

