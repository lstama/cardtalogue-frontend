IMAGE ?= registry.tama.id:30500/cardtalogue-frontend
TAG ?= arm64
PLATFORM ?= linux/arm64
DOCKER ?= docker

# The contract repo is supplied to the image build as the BuildKit named build
# context "contract-src" (see Dockerfile). Keep it as a sibling checkout, or
# override, e.g. CONTRACT_SRC=/src/cardtalogue-api-contract.
CONTRACT_SRC ?= ../cardtalogue-api-contract

.PHONY: build push check-contract-src

build: check-contract-src
	$(DOCKER) buildx build --platform $(PLATFORM) \
		--build-context contract-src=$(CONTRACT_SRC) \
		--load -t $(IMAGE):$(TAG) .

push: check-contract-src
	$(DOCKER) buildx build --platform $(PLATFORM) \
		--build-context contract-src=$(CONTRACT_SRC) \
		--push -t $(IMAGE):$(TAG) .

# Named build contexts are invisible to Docker, so a missing sibling checkout
# surfaces as an opaque "contract-src" pull error. Check here for a clear one.
check-contract-src:
	@test -f "$(CONTRACT_SRC)/contracts/backend.yaml" || { \
		echo "error: $(CONTRACT_SRC)/contracts/backend.yaml not found." >&2; \
		echo "       The image build needs cardtalogue-api-contract as the 'contract-src'" >&2; \
		echo "       BuildKit named context. Clone it next to this repo or set CONTRACT_SRC." >&2; \
		exit 1; \
	}
