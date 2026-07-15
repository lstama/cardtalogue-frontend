IMAGE ?= registry.tama.id:30500/cardtalogue-frontend
TAG ?= arm64
PLATFORM ?= linux/arm64
DOCKER ?= docker

.PHONY: build push

build:
	$(DOCKER) buildx build --platform $(PLATFORM) --load -t $(IMAGE):$(TAG) .

push:
	$(DOCKER) buildx build --platform $(PLATFORM) --push -t $(IMAGE):$(TAG) .
