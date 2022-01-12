import { View } from "react-native";

import { styles } from "./styles";

import { Button } from '../../components/Button'
import { COLORS } from "../../theme";

export function SignInBox() {
  return (
    <View style={styles.container}>
      <Button
        title="ENTRAR COM GITHUB"
        color={COLORS.BLACK_PRIMARY}
        backgroundColor={COLORS.YELLOW}
        icon="github"
      />
    </View>
  )
}