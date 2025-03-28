import { IEditSession, TokenInfo as BraceTokenInfo } from 'brace';
import { TokensProvider } from './tokens_provider';
import { Token } from './token';
import { Position } from './position';

interface TokenInfo extends BraceTokenInfo {
  type: string;
}

const toToken = (lineNumber: number, column: number, token: TokenInfo): Token => ({
  type: token.type,
  value: token.value,
  position: {
    lineNumber,
    column,
  },
});

const toTokens = (lineNumber: number, tokens: TokenInfo[]): Token[] => {
  let acc = '';
  return tokens.map((token) => {
    const column = acc.length + 1;
    acc += token.value;
    return toToken(lineNumber, column, token);
  });
};

const extractTokenFromAceTokenRow = (
  lineNumber: number,
  column: number,
  aceTokens: TokenInfo[]
) => {
  let acc = '';
  for (const token of aceTokens) {
    const start = acc.length + 1;
    acc += token.value;
    const end = acc.length;
    if (column < start) continue;
    if (column > end + 1) continue;
    return toToken(lineNumber, start, token);
  }
  return null;
};

export class AceTokensProvider implements TokensProvider {
  constructor(private readonly session: IEditSession) {}

  getTokens(lineNumber: number): Token[] | null {
    if (lineNumber < 1) return null;

    // Important: must use a .session.getLength because this is a cached value.
    // Calculating line length here will lead to performance issues because this function
    // may be called inside of tight loops.
    const lineCount = this.session.getLength();
    if (lineNumber > lineCount) {
      return null;
    }

    const tokens = (this.session.getTokens(lineNumber - 1) as unknown) as TokenInfo[];
    if (!tokens || !tokens.length) {
      // We are inside of the document but have no tokens for this line. Return an empty
      // array to represent this empty line.
      return [];
    }

    return toTokens(lineNumber, tokens);
  }

  getTokenAt(pos: Position): Token | null {

    const tokens = (this.session.getTokens(pos.lineNumber - 1) as unknown) as TokenInfo[];
    if (tokens) {
      return extractTokenFromAceTokenRow(pos.lineNumber, pos.column, tokens);
    }
    return null;
  }
}
