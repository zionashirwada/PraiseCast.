<script lang="ts">
    import { onMount } from "svelte"
    import { activePopup, activeProject, projects, projectView, quickSearchActive, showRecentlyUsedProjects, shows, special, version } from "../../stores"
    import { history } from "../helpers/history"
    import Icon from "../helpers/Icon.svelte"
    import T from "../helpers/T.svelte"
    import Link from "../inputs/Link.svelte"
    import MaterialButton from "../inputs/MaterialButton.svelte"
    import Center from "../system/Center.svelte"
    import { getVOTD } from "./votd"

    function createProject() {
        // if opened project is empty go to project list (to reduce confusion)
        if ($projects[$activeProject || ""]?.shows?.length === 0) {
            activeProject.set(null)
            projectView.set(true)
        }

        history({ id: "UPDATE", location: { page: "show", id: "project" } })

        showRecentlyUsedProjects.set(false)
    }

    function createItem(e: any) {
        if (e.detail.ctrl) {
            history({ id: "UPDATE", newData: { remember: { project: $activeProject } }, location: { page: "show", id: "show" } })
        } else activePopup.set("show")
    }

    let links: string[] = []
    function extractLinksAndCleanText(text: string) {
        links = []

        // extract and remove links from <a> tags
        const textWithoutATags = text.replace(/<a\s[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>.*?<\/a>/gi, (_match, url) => {
            links.push(url)
            return ""
        })
        // extract and remove raw links from plain text
        const finalText = textWithoutATags.replace(/https?:\/\/[^\s<>"']+/gi, (url) => {
            links.push(url)
            return ""
        })

        return finalText.replaceAll("\n", "<br>").replace(/\s+/g, " ").trim()
    }

    let votd: string = ""
    onMount(async () => {
        if ($special.splashText) return
        votd = await getVOTD()
    })
</script>

<Center class="context splash">
    <img class="logo" src="/logo.png" alt="Praisecast logo" draggable="false" />
    <h1>Praisecast</h1>
    <p style="opacity: 0.7;">v{$version}</p>
    {#if $special.splashText}
        <p style="padding-top: 30px">
            {@html extractLinksAndCleanText($special.splashText)}
            <span class="links" style="display: flex;flex-direction: column;align-items: center;">
                {#each links as link}
                    <Link url={link}>
                        {link.replace(/^(https?:\/\/)/, "")}
                        <Icon id="launch" white />
                    </Link>
                {/each}
            </span>
        </p>
    {:else if Object.keys($shows).length < 20}
        <!-- shows up for new users (can be found in "About" menu) -->
        <p style="padding-top: 30px">
            <Link url="https://geethika.zionashir.lk">
                Online Tools
                <Icon id="launch" white />
            </Link>
        </p>
    {:else if votd}
        <p class="votd" style="padding-top: 30px" data-title="Verse of the Day [votd.org]">
            <Link url="https://votd.org/">
                {votd}
            </Link>
        </p>
    {/if}

    <div class="actions" style="padding-top: 30px">
        <MaterialButton class="actionCard" title="main.quick_search" on:click={() => quickSearchActive.set(true)}>
            <div class="actionContent">
                <Icon id="search" size={3} white />
                <div class="copy">
                    <h2><T id="main.quick_search" /></h2>
                    <p>Find existing services</p>
                </div>
            </div>
        </MaterialButton>

        <MaterialButton class="actionCard" title="tooltip.project" on:click={createProject}>
            <div class="actionContent">
                <Icon id="project" size={3} white />
                <div class="copy">
                    <h2>New Service</h2>
                    <p>Create a new service plan</p>
                </div>
            </div>
        </MaterialButton>

        <MaterialButton class="actionCard" title="tooltip.show" on:click={createItem}>
            <div class="actionContent">
                <Icon id="add" size={3} white />
                <div class="copy">
                    <h2>New Item</h2>
                    <p>Add a new media item</p>
                </div>
            </div>
        </MaterialButton>
    </div>
</Center>

<style>
    :global(.loader.context) {
        width: 100%;
        min-height: 100%;
        background:
            radial-gradient(circle at top, rgb(255 255 255 / 0.08), transparent 36%),
            linear-gradient(180deg, rgb(16 18 24) 0%, rgb(10 12 16) 100%);
    }

    h1 {
        font-size: 4em;
        overflow: initial;
    }

    .logo {
        width: 82px;
        height: 82px;
        object-fit: contain;
        margin-bottom: 12px;
        filter: drop-shadow(0 6px 14px rgb(0 0 0 / 0.35));
    }

    p {
        overflow: initial;
    }

    .actions {
        display: flex;
        gap: 22px;
        width: min(1020px, calc(100% - 64px));
        flex-wrap: nowrap;
        justify-content: center;
        padding-inline: 32px;
    }

    :global(button.actionCard) {
        flex: 1 1 0;
        max-width: 240px;
        min-height: 156px;
        padding: 18px 16px;
        border: 1px solid transparent !important;
        border-radius: 10px;
        background-image:
            linear-gradient(180deg, rgb(255 255 255 / 0.03), rgb(255 255 255 / 0.01)),
            linear-gradient(135deg, rgb(255 255 255 / 0.10) 0%, rgb(225 29 72 / 0.78) 18%, rgb(225 29 72 / 0.45) 56%, rgb(225 29 72 / 0.10) 100%);
        background-origin: border-box;
        background-clip: padding-box, border-box;
        background-color: var(--primary-darkest) !important;
        color: var(--text) !important;
        box-shadow:
            inset 0 1px 0 rgb(255 255 255 / 0.05),
            inset 0 -1px 0 rgb(0 0 0 / 0.24),
            0 10px 22px rgb(0 0 0 / 0.2);
    }

    :global(button.actionCard:hover:not(:disabled)) {
        transform: translateY(-1px);
        box-shadow:
            inset 0 1px 0 rgb(255 255 255 / 0.07),
            inset 0 -1px 0 rgb(0 0 0 / 0.28),
            0 12px 26px rgb(0 0 0 / 0.28);
    }

    :global(button.actionCard) {
        width: 100%;
        height: 100%;
        padding: 0;
        justify-content: center;
    }

    :global(button.actionCard svg) {
        flex-shrink: 0;
    }

    .actionContent {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        width: 100%;
        text-align: center;
    }

    .copy {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
    }

    .copy h2 {
        margin: 0;
        font-size: 1.12em;
        font-weight: 700;
        color: var(--text);
    }

    .copy p {
        margin: 0;
        font-size: 0.78em;
        color: rgb(255 255 255 / 0.62);
        white-space: normal;
        line-height: 1.35;
    }

    .votd {
        padding: 0 10px;
        max-width: 580px;
        white-space: normal;
        text-align: left;
        font-style: italic;
        font-size: 0.9em;
    }
    .votd :global(a) {
        text-decoration: none;
    }

    @media screen and (max-height: 500px) {
        h1 {
            font-size: 3em;
        }
    }
    @media screen and (max-height: 400px) {
        h1 {
            font-size: 2em;
        }
    }
    @media screen and (max-width: 800px) {
        .logo {
            width: 64px;
            height: 64px;
        }

        h1 {
            font-size: 2em;
        }

        .actions {
            gap: 12px;
            flex-wrap: wrap;
            width: min(100%, calc(100% - 32px));
            padding-inline: 16px;
        }

        :global(button.actionCard) {
            width: 100%;
            max-width: 380px;
            min-height: 114px;
        }
    }
</style>
