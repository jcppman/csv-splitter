<script lang="ts">
  let filePath: string | undefined;
  let fileUploader: HTMLInputElement | undefined;
  let maxLines = 500;
  function getFilename(): string {
    return fileUploader?.files?.[0].name ?? 'unknow-file';
  }
  async function *getLinesFromFile(): AsyncIterable<string> {
    const utf8Decoder = new TextDecoder("utf-8");
    const reader = fileUploader?.files?.[0].stream().getReader();

    const re = /\r\n|\n|\r/gm;
    let remainder = '';
    let readerDone = false;

    do {
      const readResult = await reader.read();
      const chunk = readResult.value;
      readerDone = readResult.done;

      const content = remainder + (chunk ? utf8Decoder.decode(chunk, {stream: true}) : "");
      const result = content.split(re);
      if (result[0] === '') {
        // starting with linebreak
        // remainder is a whole line
        yield remainder;
        result.shift();
      }
      remainder = result.pop();
      for(const line of result) {
        yield line;
      }
    } while (!readerDone)

    if(remainder) {
      yield remainder;
    }
  }
  async function splitFile() {
    let firstLine: string | null = null;
    let content: string[] = [];
    let fileIndex = 1;
    for await (const line of getLinesFromFile()) {
      if (firstLine === null) {
        firstLine = line;
        continue;
      }
      content.push(line);
      if (content.length === maxLines - 1) {
        generateFile(fileIndex++, [firstLine, ...content].join('\n'));
        content = [];
      }
    }
    if (content.length > 0) {
      generateFile(fileIndex++, [firstLine, ...content].join('\n'));
    }
  }
  function generateFile(index: number, content: string) {
    const newFilename = getFilename().replace(
        /\.csv$/,
        `-${index}.csv`
    );
    const blob = new Blob([content], { type: 'text/csv' });
    const blobURL = URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = blobURL;
    tempLink.setAttribute('download', newFilename);
    tempLink.setAttribute('target', '_blank');
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    setTimeout(() => {
      // For Firefox it is necessary to delay revoking the ObjectURL
      URL.revokeObjectURL(blobURL);
    }, 100);
  }
</script>
<div class="flex flex-col items-start space-y-2">
    <div class="form-item">
      <label for="file">File</label>
      <input type="file" id="file" name="file" accept=".csv" bind:value={filePath} bind:this={fileUploader}>
    </div>
  <div class="form-item">
    <label for="lines">Lines per file</label>
    <input type="number" id="lines" name="lines" bind:value={maxLines} />
  </div>
  <div>
    <button on:click={splitFile} disabled={!filePath}>Split!</button>
  </div>
</div>
<style>
  .form-item {
    @apply flex flex-row items-start space-x-4;
  }
</style>