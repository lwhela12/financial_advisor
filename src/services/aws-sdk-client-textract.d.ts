// Type declarations for AWS Textract SDK
declare module '@aws-sdk/client-textract' {
  export interface Block {
    BlockType?: string;
    Text?: string;
  }
  export interface DetectDocumentTextCommandInput {
    Document: { Bytes: Uint8Array };
  }
  export interface DetectDocumentTextCommandOutput {
    Blocks?: Block[];
  }
  export class DetectDocumentTextCommand {
    constructor(input: DetectDocumentTextCommandInput);
  }
  export class TextractClient {
    constructor(config?: any);
    send(
      command: DetectDocumentTextCommand
    ): Promise<DetectDocumentTextCommandOutput>;
  }
}