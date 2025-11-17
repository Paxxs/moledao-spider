FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

ARG TZ
ENV TZ="$TZ"

ARG CLAUDE_CODE_VERSION=latest
ARG OPENSPEC_VERSION=latest
ARG USERNAME=node

RUN sed -i 's/deb.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list.d/debian.sources
RUN apt-get update && apt-get install -y --no-install-recommends \
    sudo \
    fzf \
    fish \
    jq \
    neovim \
    tmux \
    neofetch \
    nodejs \
    npm \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG GIT_DELTA_VERSION=0.18.2
RUN ARCH=$(dpkg --print-architecture) && \
    wget "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
    sudo dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
    rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"

RUN ARCH=$(arch) && \
    wget -qO eza.tar.gz https://github.com/eza-community/eza/releases/latest/download/eza_${ARCH}-unknown-linux-gnu.tar.gz && \
    tar xf eza.tar.gz --strip-components=1 -C /usr/local/bin && \
    rm eza.tar.gz

# Set the default shell to zsh rather than sh
ENV SHELL=/bin/fish

# Persist VS Code server cache and shared Codex data
RUN mkdir -p /home/${USERNAME}/.vscode-server /home/${USERNAME}/.codex && \
    chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}/.vscode-server /home/${USERNAME}/.codex

# Ensure default ${USERNAME} user has access to /usr/local/share
RUN mkdir -p /usr/local/share/npm-global && \
    chown -R ${USERNAME}:${USERNAME} /usr/local/share


# [Optional] Uncomment the next lines to use go get to install anything else you need
USER ${USERNAME}
# RUN go get -x <your-dependency-or-tool>
# install fisher
RUN fish -c "curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher"
RUN fish -c "fisher install patrickf1/fzf.fish"

# Set the default editor and visual
ENV EDITOR=nvim
ENV VISUAL=nvim

COPY --chown=${USERNAME} <<EOF /home/${USERNAME}/.config/fish/conf.d/eza.fish
# `ls` → `ls -laG` abbreviation
abbr -a -g ls ls -laG
# `ls` → `exa` abbreviation
# Requires `brew install exa`
if type -q eza
  abbr --add -g ls 'eza --long --classify --icons --all --header --git --tree --level 1'
end
EOF

COPY --chown=${USERNAME} <<EOF /home/${USERNAME}/.config/fish/config.fish
if status is-interactive
    # Commands to run in interactive sessions can go here
    starship init fish | source
end
EOF

# Install global packages
ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin

# Install Claude/OpenAI tooling
RUN npm --registry https://npmreg.proxy.ustclug.org/ install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}
RUN npm --registry https://npmreg.proxy.ustclug.org/ install -g @openai/codex@latest
RUN npm --registry https://npmreg.proxy.ustclug.org/ install -g @fission-ai/openspec@${OPENSPEC_VERSION}
# USER root