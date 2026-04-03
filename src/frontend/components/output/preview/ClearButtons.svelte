<script lang="ts">
    import { clearAudio } from "../../../audio/audioFading"
    import { dictionary, isFadingOut, isTimelinePlaying, labelsDisabled, media, outLocked, outputCache, outputs, playingAudio, playingMetronome, styles, timelineRecordingAction } from "../../../stores"
    import Icon from "../../helpers/Icon.svelte"
    import { getMediaLayerType } from "../../helpers/media"
    import { getActiveOutputs, getOutputContent, isOutCleared } from "../../helpers/output"
    import T from "../../helpers/T.svelte"
    import MaterialButton from "../../inputs/MaterialButton.svelte"
    import { clearAll, clearBackground, clearOverlays, clearSlide, restoreOutput } from "../clear"
    import { translateText } from "../../../utils/language"

    export let autoChange: any

    $: audioCleared = !Object.keys($playingAudio).length && !$playingMetronome
    $: allCleared = isOutCleared(null, $outputs) && audioCleared
    $: if (allCleared) autoChange = true

    let enableRestore = false
    let restoreTimeout: NodeJS.Timeout | null = null
    $: if ($outputCache) {
        enableRestore = false
        if (restoreTimeout) clearTimeout(restoreTimeout)
        restoreTimeout = setTimeout(() => (enableRestore = true), 1000)
    }
    $: if (!allCleared) {
        enableRestore = false
        outputCache.set(null)
    }

    // ACTIONS

    const clearActions = {
        background: () => clearBackground(),
        slide: () => clearSlide(),
        overlays: () => clearOverlays(),
        audio: () => clearAudio("", { clearPlaylist: true, commonClear: true })
    }

    function clear(key: string) {
        if ($outLocked || !clearActions[key]) return
        autoChange = true

        clearActions[key]()

        timelineRecordingAction.set({ id: "clear_" + key })
    }

    $: outputContent = getOutputContent("", $outputs)

    $: backgroundCleared = isOutCleared("background", $outputs)
    $: outputId = getActiveOutputs($outputs, true, true, true)[0] || ""
    $: output = $outputs[outputId] || {}
    $: outputStyle = $styles[output.style || ""] || {}
    $: canDisplayStyleBG = !outputStyle.clearStyleBackgroundOnText || (!output.out?.slide && !output.out?.background)
    $: styleBackground = backgroundCleared && !$outLocked && outputStyle.backgroundImage && canDisplayStyleBG
    $: outBackground = output.out?.background || {}
    $: backgroundData = $media[outBackground.path || ""] || {}

    $: isScripture = outputContent?.id === "temp"
    $: isMetronome = $playingMetronome && !Object.keys($playingAudio).length
    $: slideCleared = isOutCleared("slide", $outputs)

    $: effectsCleared = isOutCleared("effects", $outputs, true)
    $: overlayCleared = isOutCleared("overlays", $outputs, true)
    $: lockedOverlay = !overlayCleared && isOutCleared("overlays", $outputs, false)

    // audio fade out
    let audioIcon = "audio"
    $: if ($isFadingOut) startAudioIcon()
    else audioIcon = isMetronome ? "metronome" : "audio"
    function startAudioIcon() {
        audioIcon = "volume"
        setTimeout(() => {
            if (!$isFadingOut) return
            audioIcon = "volume_down"

            setTimeout(() => {
                if (!$isFadingOut) return
                audioIcon = "volume_off"

                setTimeout(() => {
                    if (!$isFadingOut) return
                    startAudioIcon()
                }, 1000)
            }, 400)
        }, 400)
    }
</script>

<div class="clear" data-title={translateText("guide_description.output_clear", $dictionary)}>
    <span>
        {#if allCleared && $outputCache && $outputCache?.slide?.type !== "ppt"}
            <MaterialButton style="padding: 0.6em 1em; min-height: 56px;" class="clearAll" disabled={$outLocked || !enableRestore} title="preview.restore_output" on:click={restoreOutput}>
                <Icon id="reset" size={1.2} white />
                {#if !$labelsDisabled}<T id="preview.restore_output" />{/if}
            </MaterialButton>
        {:else}
            <MaterialButton style="padding: 0.6em 1em; min-height: 56px;" class="clearAll" disabled={$outLocked || allCleared} title="clear.all [esc]" on:click={() => clearAll(true)} red>
                {#if $isTimelinePlaying}<span class="faded" data-title={translateText("popup.timeline")}><Icon id="timeline" white /></span>{/if}
                <Icon id="clear" size={1.2} white />
                {#if !$labelsDisabled}<T id="clear.all" />{/if}
            </MaterialButton>
        {/if}
    </span>

    <span class="group">
        {#if outputContent?.type !== "pdf" && outputContent?.type !== "ppt"}
            <div class="combinedButton">
                <MaterialButton style="padding: 0.6em 0.8em; min-height: 52px;{styleBackground ? 'opacity: 0.5;cursor: default;' : ''}" class="mainClear" disabled={($outLocked || backgroundCleared) && !styleBackground} title={$outLocked || backgroundCleared ? "" : "clear.background [F1]"} on:click={() => clear("background")} red>
                    <Icon id="image" size={1.2} white />
                    {#if !$labelsDisabled}
                        <span class="clearLabel">Background</span>
                    {/if}
                </MaterialButton>
            </div>
        {/if}

        {#if getMediaLayerType(outBackground.path || "", backgroundData) !== "foreground" || !slideCleared}
            <div class="combinedButton">
                <MaterialButton style="padding: 0.6em 0.8em; min-height: 52px;" class="mainClear" disabled={$outLocked || slideCleared} title="clear.slide  [F2]" on:click={() => clear("slide")} red>
                    <!-- PDFs are visually the background layer as it is toggled by the style "Background" layer, but it behaves as a slide in the code -->
                    <!-- display recording icon here if a slide recoring is playing -->
                    <Icon id={isScripture ? "scripture" : outputContent?.type === "pdf" ? "image" : "slide"} size={1.2} white />
                    {#if !$labelsDisabled}
                        <span class="clearLabel">Foreground</span>
                    {/if}
                </MaterialButton>
            </div>
        {/if}

        <div class="combinedButton">
                <MaterialButton style="padding: 0.6em 0.8em; min-height: 52px;{lockedOverlay ? 'opacity: 0.5;cursor: default;' : ''}" class="mainClear" disabled={$outLocked || (overlayCleared && effectsCleared)} title={lockedOverlay ? "" : "clear.overlays [F3]"} on:click={() => clear("overlays")} red>
                    <Icon id="overlays" size={1.2} white />
                    {#if !$labelsDisabled}
                        <span class="clearLabel">Overlays</span>
                    {/if}
                </MaterialButton>
        </div>

        <div class="combinedButton">
                <MaterialButton style="padding: 0.6em 0.8em; min-height: 52px;" class="mainClear" disabled={$outLocked || audioCleared} title="clear.audio [F4]" on:click={() => clear("audio")} red>
                    <Icon id={audioIcon} size={1.2} white />
                    {#if !$labelsDisabled}
                        <span class="clearLabel">Audio</span>
                    {/if}
                </MaterialButton>
        </div>

    </span>
</div>

<style>
    .clear {
        display: flex;
        flex-direction: column;
        padding-bottom: 0.5rem;
    }

    :global(.clearAll) {
        width: 100%;
    }

    .faded {
        position: absolute;
        left: 10px;
        opacity: 0.4;
        display: flex;
        align-items: center;
    }

    .group {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: center;
        gap: 0.75rem;
    }
    .group :global(button) {
        width: 100%;
        /* height: 40px; */

        border-radius: 0;
    }
    .clear :global(button:disabled) {
        background-color: var(--primary) !important;
    }
    .group :global(button.isActive) {
        border: none !important;
        border-right: 1px solid var(--primary-lighter) !important;
        border-left: 1px solid var(--primary-lighter) !important;
    }

    .combinedButton {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 0.25rem;
    }

    .mainClear {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        text-align: center;
        white-space: normal;
        width: 100%;
        border-radius: 10px;
    }

    .clearLabel {
        font-size: 0.82em;
        font-weight: 700;
        line-height: 1.1;
        letter-spacing: 0.01em;
    }

    .combinedButton :global(.mainClear) :global(svg) {
        margin-bottom: 2px;
    }
</style>
